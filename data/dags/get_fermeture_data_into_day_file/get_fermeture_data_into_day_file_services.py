from essence_pas_cher.essence_pas_cher_load import insert_and_update_rows


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


def get_dict_fermetures(list_of_dict):
  
  fermetures_dict = list_of_dict[0]
  
  for name, dict_df in fermetures_dict.items():
    
    return name, dict_df
  

def set_columns_and_dtypes():
  
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
  
  return columns, dtype, d_type_fermetures
  
  
def load_if_news_rows_is_true(news_rows, name):
    
  if news_rows.shape[0] > 1:
    print(f"nouvelles lignes dans la table fermetures: {news_rows.shape}")
    
    news_rows = news_rows[["type", "debut", "fin", "station_id", "injected_at","concatened_id"]]
    insert_and_update_rows(news_rows, name, primary_key="concatened_id")

  else:
    print(news_rows.shape)
    print("pas de nouvelles lignes")


def concatenate_primary_key(df):
  
  df['concatened_id'] = df['type'] + "-" + df['debut'] + "-" + df['station_id']
  
  return df


def drop_duplicates(df):

  df = df.sort_values(by=["station_id", "type", "debut", "fin"], ascending=True)

  df.drop_duplicates(subset=['type', 'debut', 'station_id'], keep='last', inplace=True)

  return df