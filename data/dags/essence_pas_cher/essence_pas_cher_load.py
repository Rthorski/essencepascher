import pandas as pd
from essence_pas_cher.essence_pas_cher_services import heure_fr_str
import psycopg
import psycopg2
from utils.connexions import conn_psycopg, psql_insert_copy, engine, conn_psycopg2
from datetime import datetime
import pytz



def load_tables_in_database(list_of_dict, date_ti, process_id):
  
  for couple_of_attributs in list_of_dict:
    
    for name, dict_df in couple_of_attributs.items():
      
      if name == 'prix':
        translate_name = 'prices'
        load_prix_table(dict_df, translate_name, process_id, date_ti)
        
      if name == 'stations':
        load_stations_table(dict_df, name, date_ti)

      elif name == 'services':
        load_services_and_horaires_table(dict_df, name)
        
      elif name == 'horaires':
        translate_name = 'opening_hours'
        load_services_and_horaires_table(dict_df, translate_name)
        
      elif name == 'ruptures':
        translate_name = 'shortages'
        load_ruptures_table(dict_df, translate_name)




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


def get_all_stations():
  get_all_stations = """
    SELECT
      id as id_station
    FROM
      dev.stations
  """

  try:
      df = pd.read_sql_query(
      sql=get_all_stations,
      con=engine
      )
  except Exception as e:
    raise e
  
  return df

def load_prix_table(dict_df, name, process_id, date_ti):
  
  delete_rows_with_process_id(name, process_id)
  
  year_month, where_condition = stg_query_where_year_is(date_ti)
  df_data_entry = stg_get_uniques_values_data_entry(dict_df, year_month)

  columns = ('name, id, fuel_updated_at, value, station_id, year, year_month')
  
  columns_to_rename = {
    'nom': 'name',
    'id': 'id',
    'maj': 'fuel_updated_at',
    'valeur': 'value',
    'station_id': 'station_id',
    'year': 'year',
    'year_month': 'year_month'
  }
  
  dtype = {
    'name': 'object',
    'id': 'object',
    'value': 'object',
    'station_id': 'object',
    'year': 'int',
    'year_month': 'str',
  }
  
  parse_dates = 'fuel_updated_at'
  
  df_table_prix = stg_get_table_with_where_condition(columns=columns, name=name, dtype=dtype, where_condition=where_condition, parse_dates=parse_dates)
  df_data_entry.rename(columns=columns_to_rename, inplace=True)
  
  df_table_prix = df_table_prix[['name', 'id', 'fuel_updated_at', 'value', 'station_id', 'year', 'year_month']]
  df_data_entry = df_data_entry[['name', 'id', 'fuel_updated_at', 'value', 'station_id', 'year', 'year_month']]
  conditions_merging = ['id', 'fuel_updated_at', 'value', 'station_id']

  news_rows = search_new_or_updated_rows(df_table=df_table_prix, df_entry_data=df_data_entry, conditions_merging=conditions_merging, name=name)

  df = get_all_stations()
  
  if news_rows.shape[0] > 0:
    news_rows["process_id"] = process_id
    news_rows = news_rows[['name', 'id', 'fuel_updated_at', 'value', 'station_id', 'injected_at', 'year', 'process_id', 'year_month']]

    df["id_station"] = pd.to_numeric(df["id_station"], downcast='integer')
    news_rows = news_rows.merge(df, how='inner', left_on='station_id', right_on='id_station')
    news_rows = news_rows[['name', 'id', 'fuel_updated_at', 'value', 'station_id', 'injected_at', 'year', 'process_id', 'year_month']]

    print("nouveaux prix", news_rows.shape)
    print("début injection nouvelles lignes")
    try:
      news_rows.to_sql(
        name=name,
        con=engine,
        schema='dev',
        if_exists='append',
        index=False,
        method=psql_insert_copy
      )
      print("fin injection nouvelles lignes")
    except Exception as e:
        print(f"Erreur lors de l'insertion des données: {e}")
        raise e
  else:
    print("pas de tarifs à jour")
  
  
def rename_columns(df, dict_rename):
  
  df = df.rename(columns=dict_rename)
  
  return df


def load_services_and_horaires_table(dict_df, name):
  
  df = pd.DataFrame(dict_df)
  
  rename_columns_opening_hours = {
    "id": "day_id",
    "nom": "day",
    "ferme": "is_closed",
    "station_id": "station_id",
    "ouverture": "opening_time",
    "fermeture": "closing_time"
  }
  
  if name == "opening_hours":
    
    df.rename(columns=rename_columns_opening_hours, inplace=True)
    

  df["station_id"] = pd.to_numeric(df["station_id"], downcast='integer')
  df_stations = get_all_stations()
  df = df.merge(df_stations, how='inner', left_on='station_id', right_on='id_station')
  df.drop(columns=['id_station'], inplace=True)
  
  try:
    with conn_psycopg2 as conn:
      with conn.cursor() as cur:
        cur.execute("DELETE FROM dev.{};".format(name))
  except psycopg2.Error as e:
    print(f"Erreur lors de la suppression de la table {name}: {e}")

    
  try:
    df.to_sql(
    name=name,
    con=engine,
    if_exists="append",
    schema="dev",
    index=False,
    method=psql_insert_copy
    )
  except Exception as e:
    print(f"Erreur lors de l'insertion des données: {e}")
    raise e
  
  
def load_stations_table(dict_df, name, date_ti):
  
  date_ti_timzeone_europe_paris = get_date_ti_in_timezone_europe_paris(date_ti)
  str_date_ti_timzeone_europe_paris = date_ti_timzeone_europe_paris.strftime("%Y-%m-%dT%H:%M:%S%z")

  columns = ('id, latitude, longitude, postal_code, population, address, city')
  
  columns_to_rename = {
    'id': 'id',
    'latitude': 'latitude',
    'longitude': 'longitude',
    'cp': 'postal_code',
    'pop': 'population',
    'adresse': 'address',
    'ville': 'city'
  }
  
  dtype = {
    'id': 'int',
    'latitude': 'object',
    'longitude': 'object',
    'postal_code': 'object',
    'population': 'object',
    'address': 'object',
    'city': 'object'
  }
  
  df_table_stations = get_table_to_dataframe(columns=columns, name=name, dtype=dtype)

  df_entry_data = read_data_entry(dict_df=dict_df)
  
  df_entry_data.rename(columns=columns_to_rename, inplace=True)
  df_entry_data = get_entry_data(df=df_entry_data, dtype=dtype)


  news_rows = search_new_or_updated_rows(df_table=df_table_stations,
                                        df_entry_data=df_entry_data,
                                        conditions_merging=None,
                                        name=name)
  
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
  
  columns = ('fuel_name, fuel_id, start_shortage, end_shortage, type, station_id, concatened_id')
  
  columns_to_rename = {
    'nom': 'fuel_name',
    'id': 'fuel_id',
    'debut': 'start_shortage',
    'fin': 'end_shortage',
    'type': 'type',
    'station_id': 'station_id'
  }
  
  dtype = {
    'fuel_name': 'object',
    'fuel_id': 'object',
    'start_shortage': 'object',
    'end_shortage': 'object',
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
  
  df_entry_data.rename(columns=columns_to_rename, inplace=True)
  df_entry_data = get_entry_data(df=df_entry_data, dtype=d_type_ruptures)
  df_entry_data.loc[df_entry_data["end_shortage"] == '', "end_shortage"] = None

  df_ruptures = concatenate_primary_key(df_entry_data)
  
  tuple_concatened_id = get_fuel_not_in_shortages(df_ruptures, df_table_rupture)
  

  news_rows = search_new_or_updated_rows(df_table=df_table_rupture,
                                         df_entry_data=df_ruptures, conditions_merging=None, name=name)
  
  print(f"nouvelles lignes ou à update dans la table ruptures: {news_rows.shape}")
  update_end_shortage(tuple_concatened_id)

  insert_and_update_rows(news_rows, name, primary_key="concatened_id")

def get_fuel_not_in_shortages(df_ruptures, df_table_rupture):
  tuple_concatened_id = df_ruptures.merge(df_table_rupture, on='concatened_id', indicator=True, how="outer", suffixes=('_entry', '_table'))
  tuple_concatened_id = tuple_concatened_id.loc[tuple_concatened_id["_merge"] == "right_only"]
  tuple_concatened_id = tuple_concatened_id["concatened_id"].to_list()
  return tuple(tuple_concatened_id)

def update_end_shortage(tuple_concatened_id):
  
  query_update_end_shortage = """
  UPDATE dev.shortages
  SET end_shortage = now()
  WHERE concatened_id IN {}
  AND end_shortage IS NULL
  """.format(tuple_concatened_id)
  
  try:
    with psycopg.connect(conn_psycopg) as conn:
      with conn.cursor() as cur:
        cur.execute("SET TIME ZONE 'Europe/Paris'")
        cur.execute(query_update_end_shortage)
  except Exception as e:
    print(f"Erreur lors de la mise à jour des ruptures: {e}")
    raise e
  else:
    print("Les dates de fin de rupture ont été mises à jour")

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


def search_new_or_updated_rows(df_table, df_entry_data, conditions_merging, name):
  
  if "prices" in name or "shortages" in name:

    df_table["station_id"] = pd.to_numeric(df_table["station_id"], downcast='integer')
    df_entry_data["station_id"] = pd.to_numeric(df_entry_data["station_id"], downcast='integer')
    
    new_or_updated_lines = pd.merge(df_entry_data, df_table, how="left", indicator=True, on=conditions_merging, suffixes=('_entry', '_table'))
    
    if "prices" in name:

      new_or_updated_lines.drop(columns=['name_table', 'year_table', 'year_month_table'], inplace=True)
      new_or_updated_lines.rename(columns={'name_entry': 'name', 'year_entry': 'year', 'year_month_entry': 'year_month'}, inplace=True)
      
    new_or_updated_lines = new_or_updated_lines.loc[new_or_updated_lines["_merge"] == "left_only"]
    new_or_updated_lines.drop(columns="_merge", inplace=True)
    new_or_updated_lines["injected_at"] = heure_fr_str
    
  elif "stations" in name:
    new_or_updated_lines = pd.merge(df_entry_data, df_table, how="left")
  
  return new_or_updated_lines
  

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

  return year_month, where_condition
  
    
def concatenate_primary_key(df):
  
  df['concatened_id'] = df['fuel_id'] + "-" + df['start_shortage'] + "-" + df['station_id']
  
  return df