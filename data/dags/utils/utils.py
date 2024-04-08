from google.cloud import storage
from dotenv import dotenv_values

config = dotenv_values('/opt/airflow/dags/.env')

def authentificateServiceAccount():
  
  credentials = config["GOOGLE_APPLICATION_CREDENTIALS"]
  
  try:
    storage_client = storage.Client.from_service_account_json(credentials)
  except Exception as e:
    print(f"Erreur: {e}")
    
  return storage_client