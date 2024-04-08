from google.cloud import storage
from dotenv import dotenv_values
import os
from datetime import datetime
import requests
from airflow.exceptions import AirflowException
from utils.utils import authentificateServiceAccount

def renameObjectName(url):
  
  object_name = url.split('/')
  object_name = object_name[-2:]
  object_name = (', ').join(object_name)
  datetime_now = datetime.now()
  object_name = str(datetime_now) + f"_{object_name}.xml"
  object_name = object_name.replace(' ', '').replace(',', '_')
  
  return object_name
  
def uploadOnGcpBucket():
  
  storage_client = authentificateServiceAccount()
  url = "https://donnees.roulez-eco.fr/opendata/instantane"
  response = requests.get(url)
  bucket_name = 'essencepascher_files'
  bucket = storage_client.bucket(bucket_name)
  object_name = renameObjectName(url)
  
  if response.status_code != 200:
    raise AirflowException(f"Echec de la requête HTTP, statut: {response.status_code} pour l'url suivant: {url}")

  try:
    blob = bucket.blob(f"in/{object_name}")
    blob.upload_from_string(response.content)
  except Exception as e:
    print(f"Erreur lors du téléchargement et de l'import dans le bucket {bucket_name}: {e}")