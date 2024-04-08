from google.cloud import storage
from dotenv import dotenv_values

def authentificateServiceAccount():
  
  config = dotenv_values('/opt/airflow/dags/.env')
  credentials = config["GOOGLE_APPLICATION_CREDENTIALS"]
  print(credentials)
  
  try:
    storage_client = storage.Client.from_service_account_json(credentials)
  except Exception as e:
    print(f"Erreur: {e}")
    
  return storage_client