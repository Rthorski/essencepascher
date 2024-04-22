from datetime import datetime
import requests
from airflow.exceptions import AirflowException
from utils.connexions import bucket, bucket_name, conn_psycopg, psql_insert_copy, engine
import xml.etree.ElementTree as ET
from io import BytesIO
import zipfile
import psycopg
import pandas as pd

def rename_object_name(url):
  
  object_name = url.split('/')
  object_name = object_name[-2:]
  object_name = (', ').join(object_name)
  datetime_now = datetime.now()
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
        
    stations.append(pdv_dict)
    
  return [{"stations": stations}, {"horaires": jours}, {"services": services}, {"prix": prix}, {"ruptures": ruptures}]
  
  
def load_tables_in_database(list_of_dict):
  
  for couple_of_attributs in list_of_dict:
    
    for name, dict_df in couple_of_attributs.items():
      
      df = pd.DataFrame(dict_df)
      
      df.to_sql(
          name=f"{name}",
          con=engine,
          if_exists='replace',
          schema="dev",
          method=psql_insert_copy,
          index=False
        )


def drop_dev_schema_database():
  
  with psycopg.connect(conn_psycopg) as conn:
    with conn.cursor() as cur:
      cur.execute('DROP SCHEMA if exists dev CASCADE;')
      cur.execute('CREATE SCHEMA dev;')
      