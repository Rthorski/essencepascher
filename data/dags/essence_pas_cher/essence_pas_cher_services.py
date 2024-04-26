from datetime import datetime
import requests
from airflow.exceptions import AirflowException
from utils.connexions import bucket, bucket_name, conn_psycopg, psql_insert_copy, engine
import xml.etree.ElementTree as ET
from io import BytesIO
import zipfile
import psycopg
import pandas as pd
import pytz

timezone_paris = pytz.timezone('Europe/Paris')
heure_fr = datetime.now(timezone_paris)

def rename_object_name(url):
  
  object_name = url.split('/')
  object_name = object_name[-2:]
  object_name = (', ').join(object_name)
  datetime_now = heure_fr
  object_name = str(datetime_now) + f"_{object_name}.xml"
  object_name = object_name.replace(' ', '').replace(',', '_')
  return object_name


def get_data_from_api(url):
  
  response = requests.get(url)
  
  if response.status_code != 200:
    raise AirflowException(f"Echec de la requête HTTP, statut: {response.status_code} pour l'url suivant: {url}")
  return response


def upload_on_gcp_bucket(url, response):
  
  object_name = rename_object_name(url)
  
  if response.status_code != 200:
    raise AirflowException(f"Echec de la requête HTTP, statut: {response.status_code} pour l'url suivant: {url}")

  try:
    blob = bucket.blob(f"in/{object_name}")
    blob.upload_from_string(response.content)
  except Exception as e:
    print(f"Erreur lors du téléchargement et de l'import dans le bucket {bucket_name}: {e}")
    
  return object_name


def parseFile(path):
  
  blob = bucket.blob(f"in/{path}")
  zip_data = blob.download_as_bytes()
  zip_bytes_io = BytesIO(zip_data)

  with zipfile.ZipFile(zip_bytes_io, 'r') as zip_ref:
    name = zip_ref.namelist()[0]
    xml_data = zip_ref.read(name)
    root = ET.fromstring(xml_data)
    return root

def create_dataframes(root):

  stations = []
  jours = []
  services = []
  prix = []
  ruptures = []
  fermetures = []

  for pdv in root.findall('pdv'):
    pdv_dict = pdv.attrib
    station_id = pdv.attrib['id']
    station_id_dict = {"station_id": station_id}
    for child in pdv:
      if child.tag == 'adresse':
        pdv_dict[child.tag] = child.text
      elif child.tag == 'ville':
        pdv_dict[child.tag] = child.text
      elif child.tag == 'services':
        for service in child.findall('service'):
          service_dict = {"service": service.text}
          service_dict = {**service_dict, **station_id_dict}
          services.append(service_dict)
      elif child.tag == 'horaires':
        for j in child.findall('jour'):
          try:
            j_dict = {**j.attrib, **j.find('horaire').attrib, **station_id_dict}
            jours.append(j_dict)
          except:
            j_dict = {**j.attrib, **station_id_dict}
            jours.append(j_dict)
      elif child.tag == 'prix':
        prix.append({**child.attrib, **station_id_dict})
      elif child.tag == 'rupture':
        ruptures.append({**child.attrib, **station_id_dict})
      elif child.tag == 'fermeture':
        fermetures.append({**child.tag, **station_id_dict})        
    stations.append(pdv_dict)
    
  return [{"stations": stations}, {"horaires": jours}, {"services": services}, {"prix": prix}, {"ruptures": ruptures}, {"fermetures": fermetures}]


def load_tables_in_database(list_of_dict, date_ti):
  
  for couple_of_attributs in list_of_dict:
    
    for name, dict_df in couple_of_attributs.items():
      
      if name == 'stations':
        load_stations_table(dict_df, name, date_ti)
      
      elif name == 'services' or name == 'horaires':
        load_services_and_horaires_table(dict_df, name)
      
      elif name == 'prix':
        get_new_rows_and_load(dict_df, name, date_ti)
        
      elif name == 'ruptures':
        get_new_rows_and_load(dict_df, name, date_ti)
        
        pass


def get_new_rows_and_load(dict_df, name, date_ti):
  
  df = if_table_exists(dict_df, name, date_ti, primary_key=False)
  
  if df is not None:
    df_donnees_entrantes = pd.DataFrame(dict_df) 
    search_new_lines = pd.merge(df_donnees_entrantes, df, how="left", indicator=True)
    news_rows = search_new_lines.loc[search_new_lines["_merge"] == "left_only"]
    news_rows.drop(columns="_merge", inplace=True)
    news_rows["injected_at"].fillna(heure_fr, inplace=True)
    insert_into_table(news_rows, name)
  

def insert_into_table(df, name):
  
  values_sql = ','.join(['%s'] * len(df.columns))
  columns = list(df.columns)
  columns_tuple = tuple(columns)
  col_without_apostrophes = ', '.join(columns_tuple)
  query = f"""
    INSERT INTO dev.{name} ({col_without_apostrophes})
    VALUES ({values_sql})
  """
  
  with psycopg.connect(conn_psycopg) as conn:
    with conn.cursor() as cur:
      cur.executemany(query, [tuple(row) for row in df.values])
  

def load_services_and_horaires_table(dict_df, name):
  
  df = pd.DataFrame(dict_df)
  try:
    with psycopg.connect(conn_psycopg) as conn:
      with conn.cursor() as cur:
        cur.execute(f"DROP TABLE dev.{name} CASCADE;")
  except:
    print(f"la table {name} n'existe pas")
  
  df.to_sql(
  name=name,
  con=engine,
  if_exists="replace",
  schema="dev",
  method=psql_insert_copy,
  index=False
  )
  
        
def load_stations_table(dict_df, name, date_ti):
  
  df_query = if_table_exists(dict_df, name, date_ti, primary_key=True)
  
  if df_query is not None:
    date_max_of_scheduling = str(df_query["date_of_scheduling"].max())

    if date_ti > date_max_of_scheduling:
      df_stations = pd.DataFrame(dict_df)
      df_stations['id'] = df_stations['id'].astype('int')
      search_new_lines = pd.merge(df_stations, df_query, how="left", indicator=True)
      news_rows = search_new_lines.loc[search_new_lines["_merge"] == "left_only"]
      
      if news_rows.shape[0] > 0:
        news_rows.drop(columns="_merge", inplace=True)
        news_rows["injected_at"] = heure_fr
        news_rows["date_of_scheduling"] = date_ti
        news_rows["date_of_scheduling"] = pd.to_datetime(df_query["date_of_scheduling"], yearfirst=True)
        insert_and_update_rows(news_rows)


def insert_and_update_rows(df):

  values_sql = ','.join(['%s'] * len(df.columns))
  
  with psycopg.connect(conn_psycopg) as conn:
    with conn.cursor() as cur:
      
      update_query = "ON CONFLICT (id) DO UPDATE SET " + \
                    ", ".join([f"{col} = EXCLUDED.{col}" for col in df.columns if col != 'id'])
      
      insert_query = f"INSERT INTO dev.stations (id, latitude, longitude, cp, pop, adresse, ville, injected_at, date_of_scheduling) VALUES ({values_sql}) {update_query}"
      cur.executemany(insert_query, [tuple(row) for row in df.values])
  

def if_table_exists(dict_df, name, date_ti, primary_key):
  
  try:
    df_query = pd.read_sql_query(
    sql=f"SELECT * FROM dev.{name}",
    con=engine
  )
    return df_query
  
  except:
    df = pd.DataFrame(dict_df)
    df["injected_at"] = heure_fr
    if name == 'stations':
      df["date_of_scheduling"] = date_ti
      df["date_of_scheduling"] = pd.to_datetime(df["date_of_scheduling"], yearfirst=True)
      df['id'] = df["id"].astype('int')
    print("first load")
          
    df.to_sql(
      name=name,
      con=engine,
      if_exists="replace",
      schema="dev",
      method=psql_insert_copy,
      index=False
    )
    if primary_key:
      query = """
        ALTER TABLE dev.{}
        ADD PRIMARY KEY (id);
      """.format(name)
      with psycopg.connect(conn_psycopg) as conn:
        with conn.cursor() as cur:
          cur.execute(query)