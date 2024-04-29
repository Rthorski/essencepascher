import pandas as pd
from essence_pas_cher.essence_pas_cher_load import get_table_to_dataframe, read_data_entry, get_entry_data, search_new_or_updated_rows, insert_and_update_rows

def create_dataframes(root):

  fermetures = []

  for pdv in root.findall('pdv'):
    station_id = pdv.attrib['id']
    station_id_dict = {"station_id": station_id}
    for child in pdv:
      if child.tag == 'fermeture':
        if child.attrib:
          fermetures.append({**child.attrib, **station_id_dict})   
         
  return [{"fermetures": fermetures}]

def load_tables_in_database(list_of_dict):
  
  for couple_of_attributs in list_of_dict:
    
    for name, dict_df in couple_of_attributs.items():
      
      load_fermetures_table(dict_df, name)


def load_fermetures_table(dict_df, name):
  
  columns = ('type, debut, fin, station_id, concatened_id')
  
  dtype = {
    'type': 'object',
    'debut': 'object',
    'fin': 'object',
    'station_id': 'object',
    'concatened_id': 'object'
  }
  
  d_type_fermetures = dtype.copy()
  d_type_fermetures.pop('concatened_id')
  
  df_table_fermetures = get_table_to_dataframe(columns=columns, name=name, dtype=dtype)

  df_entry_data = read_data_entry(dict_df=dict_df)
  df_entry_data = get_entry_data(df=df_entry_data, dtype=d_type_fermetures)
  df_fermetures = concatenate_primary_key(df_entry_data)

  news_rows = search_new_or_updated_rows(df_table=df_table_fermetures,
                                         df_entry_data=df_fermetures)
  
  print(f"nouvelles lignes dans la table fermetures: {news_rows.shape}")
  
  news_rows = news_rows[["type", "debut", "fin", "station_id", "injected_at","concatened_id"]]
  insert_and_update_rows(news_rows, name, primary_key="concatened_id")


def concatenate_primary_key(df):
  
  df['concatened_id'] = df['type'] + "-" + df['debut'] + "-" + df['station_id']
  
  return df