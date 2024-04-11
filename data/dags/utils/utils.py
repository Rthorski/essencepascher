from google.cloud import storage
from dotenv import dotenv_values
from sqlalchemy import create_engine
import psycopg2
import psycopg

config = dotenv_values('/opt/airflow/dags/.env')
engine = create_engine(f'postgresql+psycopg2://{config["POSTGRES_USER"]}:{config["POSTGRES_PASSWORD"]}@{config["POSTGRES_HOST"]}:5432/{config["POSTGRES_DB"]}')

def authentificateServiceAccount():
  
  credentials = config["GOOGLE_APPLICATION_CREDENTIALS"]
  
  try:
    storage_client = storage.Client.from_service_account_json(credentials)
  except Exception as e:
    print(f"Erreur: {e}")
    
  return storage_client

storage_client = authentificateServiceAccount()
bucket_name = 'essencepascher_files'
bucket = storage_client.bucket(bucket_name)

conn_psycopg2 = psycopg2.connect(
  dbname=config["POSTGRES_DB"],
  user=config['POSTGRES_USER'],
  password=config['POSTGRES_PASSWORD'],
  host=config['POSTGRES_HOST']
)

conn_psycopg = f'postgresql://{config["POSTGRES_USER"]}:{config["POSTGRES_PASSWORD"]}@{config["POSTGRES_HOST"]}:5432/{config["POSTGRES_DB"]}'