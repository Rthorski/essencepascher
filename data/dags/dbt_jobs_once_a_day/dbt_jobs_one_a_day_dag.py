from airflow import DAG
from airflow.operators.bash import BashOperator
import datetime
from pytz import timezone


default_args = {
    'owner': 'rthorski',
    'start_date': datetime.datetime(2024, 1, 1, tzinfo=timezone('Europe/Paris')),
}

with DAG(
  dag_id="dbt_jobs_once_a_day",
  max_active_runs=1,
  default_args=default_args,
  schedule="0 9 * * *",
  catchup=False,
) as dag:
    
  task_mart_ytd_price_trend = BashOperator(
  task_id="mart_ytd_price_trend",
  bash_command="cd ${AIRFLOW_HOME}/dags/dbt_essencepascher && dbt run --target prod --select 'marts.mart_ytd_price_trend'",
)
  
  task_mart_one_year_price_trend = BashOperator(
  task_id="mart_one_year_price_trend",
  bash_command="cd ${AIRFLOW_HOME}/dags/dbt_essencepascher && dbt run --target prod --select 'marts.mart_one_year_price_trend'",
  )
  
  task_mart_ytd_price_trend >> task_mart_one_year_price_trend