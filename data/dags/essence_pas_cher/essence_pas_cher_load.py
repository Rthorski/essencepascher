import pandas as pd
from essence_pas_cher.essence_pas_cher_services import heure_fr, heure_fr_str
import psycopg
from utils.connexions import conn_psycopg, psql_insert_copy, engine
from datetime import datetime
import numpy as np
import pytz



def load_tables_in_database(list_of_dict, date_ti, process_id):
  
  for couple_of_attributs in list_of_dict:
    
    for name, dict_df in couple_of_attributs.items():
      
      if name == 'prix':
        load_prix_table(dict_df, name, process_id, date_ti)
        
      elif name == 'stations':
        load_services_and_horaires_and_stations_table(dict_df, name)

      elif name == 'services':
        load_services_and_horaires_and_stations_table(dict_df, name)
        
      elif name == 'horaires':
        load_services_and_horaires_and_stations_table(dict_df, name)
        
      elif name == 'ruptures':
        load_ruptures_table(dict_df, name)


def delete_rows_with_process_id(name, process_id):
  
  print(f"process id: {process_id}")
  print('--------------nb de lignes avec le process id-----')
  query = """
    SELECT
      *
    FROM
      dev.{}
    WHERE process_id = '{}'
  """.format(name, process_id)
  
  df = pd.read_sql_query(sql=query, con=engine)
  print(f"taille df lignes avec process id: {df.shape}")
  
  print("----------------debut suppression ligne process_id-------")
  query = """
    DELETE
    FROM
      dev.{}
    WHERE process_id = '{}'
  """.format(name, process_id)
  
  with psycopg.connect(conn_psycopg) as con:
    with con.cursor() as cur:
      cur.execute(query)
  print("----------------fin suppression ligne process_id-------")


def load_prix_table(dict_df, name, process_id, date_ti):
  
  delete_rows_with_process_id(name, process_id)
  
  year_month, where_condition = stg_query_where_year_is(date_ti)
  df_data_entry = stg_get_uniques_values_data_entry(dict_df, year_month)

  columns = ('nom, id, maj, valeur, station_id, year, year_month')
  
  dtype = {
    'nom': 'object',
    'id': 'object',
    'valeur': 'object',
    'station_id': 'object',
    'year': 'int',
    'year_month': 'str',
  }
  
  parse_dates = 'maj'
  
  df_table_prix = stg_get_table_with_where_condition(columns=columns, name=name, dtype=dtype, where_condition=where_condition, parse_dates=parse_dates)
  
  news_rows = search_new_or_updated_rows(df_table=df_table_prix, df_entry_data=df_data_entry)

  if news_rows.shape[0] > 0:
    news_rows["process_id"] = process_id
    news_rows = news_rows[['nom', 'id', 'maj', 'valeur', 'station_id', 'injected_at', 'year', 'process_id', 'year_month']]

    print(f"nb de nouveaux prix: {news_rows.shape}")

    print("début injection nouvelles lignes")
    news_rows.to_sql(
      name="prix",
      con=engine,
      schema='dev',
      if_exists='append',
      index=False,
      method=psql_insert_copy
    )
    print("fin injection nouvelles lignes")
    
  else:
    print("pas de tarifs à jour")


def load_services_and_horaires_and_stations_table(dict_df, name):
  
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
  
  date_ti_timzeone_europe_paris = get_date_ti_in_timezone_europe_paris(date_ti)
  str_date_ti_timzeone_europe_paris = date_ti_timzeone_europe_paris.strftime("%Y-%m-%dT%H:%M:%S%z")

  columns = ('id, latitude, longitude, cp, pop, adresse, ville, date_of_scheduling')
  
  dtype = {
    'id': 'int',
    'latitude': 'object',
    'longitude': 'object',
    'cp': 'object',
    'pop': 'object',
    'adresse': 'object',
    'ville': 'object',
    'date_of_scheduling': 'string'
  }
  
  df_table_stations = get_table_to_dataframe(columns=columns, name=name, dtype=dtype)
  date_max_of_scheduling = str(df_table_stations["date_of_scheduling"].max())
  df_table_stations.drop(columns=['date_of_scheduling'], inplace=True)
  
  if str_date_ti_timzeone_europe_paris > date_max_of_scheduling:

    df_entry_data = read_data_entry(dict_df=dict_df)
    
    df_entry_data = get_entry_data(df=df_entry_data, dtype=dtype)

    news_rows = search_new_or_updated_rows(df_table=df_table_stations,
                                          df_entry_data=df_entry_data)
    
    news_rows["date_of_scheduling"] = str_date_ti_timzeone_europe_paris
    print(f"taille de la table stations: {df_table_stations.shape}")
    print(f"taille des données entrantes: {df_entry_data.shape}")
    print(f"nouvelles lignes ou lignes à modifier dans la table stations: {news_rows.shape}")
    insert_and_update_rows(news_rows, name, primary_key='id')


def insert_and_update_rows(df, name, primary_key):
  
  columns = list(df.columns)
  columns_tuple = tuple(columns)
  col_without_apostrophes = ', '.join(columns_tuple)
  values_sql = ','.join(['%s'] * len(df.columns))
  data = df.values.tolist()

  with psycopg.connect(conn_psycopg) as conn:
    with conn.cursor() as cur:
      
      update_query = f"ON CONFLICT ({primary_key}) DO UPDATE SET " + \
                    ", ".join([f"{col} = EXCLUDED.{col}" for col in df.columns if col != {primary_key}])
      
      insert_query = f"INSERT INTO dev.{name} ({col_without_apostrophes}) VALUES ({values_sql}) {update_query}"
      
      cur.executemany(insert_query, data)


def load_ruptures_table(dict_df, name):
  
  columns = ('nom, id, debut, fin, type, station_id, concatened_id')
  
  dtype = {
    'nom': 'object',
    'id': 'object',
    'debut': 'object',
    'fin': 'object',
    'type': 'object',
    'station_id': 'object',
    'concatened_id': 'object'
  }
  
  d_type_ruptures = dtype.copy()
  d_type_ruptures.pop('concatened_id')
  
  df_table_rupture = get_table_to_dataframe(columns=columns, name=name, dtype=dtype)
  df_entry_data = read_data_entry(dict_df=dict_df)
  
  if 'type' not in df_entry_data:
    d_type_ruptures.pop('type')
  
  df_entry_data = get_entry_data(df=df_entry_data, dtype=d_type_ruptures)
  df_ruptures = concatenate_primary_key(df_entry_data)
  news_rows = search_new_or_updated_rows(df_table=df_table_rupture,
                                         df_entry_data=df_ruptures)
  
  news_rows = news_rows[['nom', 'id', 'debut', 'fin', 'type', 'station_id', 'injected_at', 'concatened_id']]
  print(f"taille de la table ruptures: {df_table_rupture.shape}")
  print(f"taille des données entrantes: {df_entry_data.shape}")
  print(f"nouvelles lignes ou à update dans la table ruptures: {news_rows.shape}")

  insert_and_update_rows(news_rows, name, primary_key="concatened_id")
    


def insert_into_table(df, name):
  
  values_sql = ','.join(['%s'] * len(df.columns))
  columns = list(df.columns)
  columns_tuple = tuple(columns)
  col_without_apostrophes = ', '.join(columns_tuple)
  query = f"""
    INSERT INTO dev.{name} ({col_without_apostrophes})
    VALUES ({values_sql})
  """
  data = df.values.tolist()
  
  with psycopg.connect(conn_psycopg) as conn:
    with conn.cursor() as cur:
      cur.executemany(query, data)

def stg_get_table_with_where_condition(columns, name, dtype, where_condition, parse_dates):
  
  query_select_from = """
    SELECT
      {}
    FROM
      dev.{}
  """.format(columns, name)

  total_query = query_select_from + where_condition
  
  try:
      df = pd.read_sql_query(
      sql=total_query,
      con=engine,
      dtype=dtype,
      parse_dates=parse_dates
      )
      return df
  except Exception as e:
    raise e


def get_table_to_dataframe(columns, name, dtype):
  
  query = """
    SELECT
      {}
    FROM
      dev.{}
  """.format(columns, name)
  
  try:
      df = pd.read_sql_query(
      sql=query,
      con=engine,
      dtype=dtype,
    )

      return df
    
  except Exception as e:
    raise e
  
def read_data_entry(dict_df):
  
  df_entry_data = pd.DataFrame(dict_df)
  
  return df_entry_data
  
  
def get_entry_data(df, dtype):
  
  dtype_entry_data = dtype.copy()
  
  try:
    dtype_entry_data.pop('date_of_scheduling')
  except:
    pass
  
  df = df.astype(dtype_entry_data)
  
  return df


def search_new_or_updated_rows(df_table, df_entry_data):


  new_or_updated_lines = pd.merge(df_entry_data, df_table, how="left", indicator=True)
  news_rows = new_or_updated_lines.loc[new_or_updated_lines["_merge"] == "left_only"]
  news_rows.drop(columns="_merge", inplace=True)
  news_rows["injected_at"] = heure_fr_str
  return news_rows
  

  
def stg_get_uniques_values_data_entry(dict_df, year_month):
  
  df = pd.DataFrame(dict_df)
  df["maj"] = pd.to_datetime(df["maj"], yearfirst=True)
  df = df.loc[~(df['maj'].isnull())]
  df["year"] = df['maj'].dt.year
  df['year'] = df['year'].astype('int')
  df['year_month'] = df['maj'].dt.to_period('M')
  df['year_month'] = df['year_month'].astype('str')
  
  df = df.loc[
    (df['year_month'] == year_month)
  ]
  

  # list_years_unique_values = list(df['year'].unique())
  # if len(list_years_unique_values) == 0:
  #   raise Exception("taille de la liste à 0, il ne peut pas y avoir aucune valeur unique de la colonne year")
  # return df, list_years_unique_values
  return df
  
def get_date_ti_in_timezone_europe_paris(date_ti):
  
  paris_tz = pytz.timezone("Europe/Paris")
  date_object = datetime.strptime(date_ti, "%Y-%m-%dT%H:%M:%S%z")
  date_object_paris = date_object.astimezone(paris_tz)
  return date_object_paris

  
def stg_query_where_year_is(date_ti):
  
  date_object_paris = get_date_ti_in_timezone_europe_paris(date_ti)
  year_month = date_object_paris.strftime("%Y-%m")
  year_month = str(year_month)
  
  where_condition = """
  WHERE 
    year_month = '{}';
  """.format(year_month)
  
  # if len(list_years_unique_values) == 1:
  #   print("longueur de list years égale à 1")
  #   where_condition = list_years_unique_values[0]
  #   print(where_condition)
  #   query = """
  #   WHERE
  #     year = {}
  #   """.format(where_condition)
  #   return query
    
  # elif len(list_years_unique_values) > 1:
  #   print(list_years_unique_values)
  #   min_year = min(list_years_unique_values)
  #   print(min_year)
  #   max_year = max(list_years_unique_values)
  #   print(max_year)
  #   query = """
  #   WHERE
  #     year BETWEEN {} AND {};
  #   """.format(min_year, max_year)
  #   return query
  
  return year_month, where_condition
  
    







def if_table_exists(dict_df, name, date_ti, primary_key):

  current_date = datetime.now().date()
  date_string = current_date.strftime("%Y-%m-%d")
  
  if name == 'prix':
  
      df_query = pd.read_sql_query(
      # sql=f"SELECT * FROM dev.{name} WHERE date_maj = '{date_string}'",
      sql=f"SELECT * FROM dev.{name} WHERE year = 2012",
      con=engine
    )
      print(df_query.shape)
      return df_query
  
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
      df["date_of_scheduling"] = pd.to_datetime(df["date_of_scheduling"], format="ISO8601")
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


def concatenate_primary_key(df):
  
  df['concatened_id'] = df['id'] + "-" + df['debut'] + "-" + df['station_id']
  
  return df