from essence_pas_cher.essence_pas_cher_services import parseFile
from get_fermeture_data_into_day_file.get_fermeture_data_into_day_file_services import create_dataframes, load_tables_in_database

def load_to_database(**context):
  ti = context['ti']
  object_name = ti.xcom_pull(key='object_name', task_ids='upload_on_gcp')
  root = parseFile(object_name)
  list_of_dict = create_dataframes(root)
  load_tables_in_database(list_of_dict)
