from essence_pas_cher.essence_pas_cher_services import parseFile
from get_fermeture_data_into_day_file.get_fermeture_data_into_day_file_services import create_dataframes, get_dict_fermetures, set_columns_and_dtypes, drop_duplicates, concatenate_primary_key, load_if_news_rows_is_true
from essence_pas_cher.essence_pas_cher_load import get_entry_data, search_new_or_updated_rows, read_data_entry, get_table_to_dataframe, get_all_stations

def load_to_database(**context):
  ti = context['ti']
  object_name = ti.xcom_pull(key='object_name', task_ids='upload_on_gcp')
  root = parseFile(object_name)
  list_of_dict = create_dataframes(root)
  name, dict_df = get_dict_fermetures(list_of_dict)
  columns, dtype, d_type_fermetures = set_columns_and_dtypes()
  df_entry_data = read_data_entry(dict_df=dict_df)
  df_entry_data = drop_duplicates(df_entry_data)
  df_entry_data = get_entry_data(df=df_entry_data, dtype=d_type_fermetures)
  df_stations = get_all_stations()
  df_fermetures = concatenate_primary_key(df_entry_data)
  df_table_fermetures = get_table_to_dataframe(columns=columns, name=name, dtype=dtype)
  news_rows = search_new_or_updated_rows(df_table=df_table_fermetures,
                                          df_entry_data=df_fermetures)
  news_rows = news_rows.merge(df_stations, left_on='station_id', right_on='id_station')
  load_if_news_rows_is_true(news_rows, name)
