from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from essence_pas_cher.essence_pas_cher_controller import upload_on_gcp, load_to_database
import datetime
import uuid


default_args = {
    'owner': 'rthorski',
    'start_date': datetime.datetime(2024, 1, 1),
}

with DAG(
  dag_id="essence_pas_cher",
  max_active_runs=1,
  default_args=default_args,
  schedule="*/10 5-19 * * *",  
  catchup=False,
  params={"url": "https://donnees.roulez-eco.fr/opendata/instantane_ruptures", "process_id": uuid.uuid4()}
) as dag:
  
  task_upload_on_gcp = PythonOperator(
  task_id='upload_on_gcp',
  python_callable=upload_on_gcp
)
  
  task_load_to_database = PythonOperator(
  task_id='load_to_database',
  python_callable=load_to_database
)
  
  task_dbt_staging = BashOperator(
  task_id="dbt_run_staging",
  bash_command="cd ${AIRFLOW_HOME}/dags/dbt_essencepascher && dbt run --target staging --select 'staging'"
)
  
  task_dbt_marts = BashOperator(
  task_id="dbt_run_marts",
  bash_command="cd ${AIRFLOW_HOME}/dags/dbt_essencepascher && dbt run --target prod --select 'marts'"
)
  
task_upload_on_gcp >> task_load_to_database >> task_dbt_staging >> task_dbt_marts
