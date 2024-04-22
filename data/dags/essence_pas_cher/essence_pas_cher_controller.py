from essence_pas_cher.essence_pas_cher_services import get_data_from_api, upload_on_gcp_bucket
from essence_pas_cher.essence_pas_cher_services import parseFile, create_dataframes, load_tables_in_database

def upload_on_gcp(**context):
  
  ti = context['ti']
  url = context['params']['url']
  response = get_data_from_api(url)
  object_name = upload_on_gcp_bucket(url, response)
  ti.xcom_push(key='object_name', value=object_name)
  
def load_to_database(**context):
  ti = context['ti']
  object_name = ti.xcom_pull(key='object_name', task_ids='upload_on_gcp')
  root = parseFile(object_name)
  list_of_dict = create_dataframes(root)
  load_tables_in_database(list_of_dict)
    
  