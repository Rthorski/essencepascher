from airflow import DAG
from airflow.operators.python import PythonOperator
from essence_pas_cher.essence_pas_cher_controller import upload_on_gcp
from get_fermeture_data_into_day_file.get_fermeture_data_into_day_file_controller import load_to_database
import datetime
from pytz import timezone

default_args = {
    'owner': 'rthorski',
    'start_date': datetime.datetime(2024, 1, 1, tzinfo=timezone('Europe/Paris')),
}

with DAG(
  dag_id="get_fermeture_data_into_day_file",
  default_args=default_args,
  max_active_runs=1,
  schedule="0 9 * * *",
  catchup=False,
  params={"url": "https://donnees.roulez-eco.fr/opendata/annee/2024"}
) as dag:
  
  task_upload_on_gcp = PythonOperator(
  task_id='upload_on_gcp',
  python_callable=upload_on_gcp
)
  
  task_load_to_database = PythonOperator(
  task_id='load_to_database',
  python_callable=load_to_database
)
  
  task_upload_on_gcp >> task_load_to_database