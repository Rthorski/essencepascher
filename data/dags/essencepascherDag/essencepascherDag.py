from airflow.decorators import dag, task
import datetime
from essencepascherDag.downloadAndUploadFiles.downloadAndUploadFiles import uploadOnGcpBucket, parsefile
from utils.utils import storage_client

@dag(start_date=datetime.datetime(2024, 1, 1), schedule=None, catchup=False)
def essencepascherDag():
  
  @task
  def upload_on_gcp_bucket(storage_client):
    return uploadOnGcpBucket(storage_client)
  
  @task
  def parse_file(object_name):
    return parsefile(object_name)
  
  path = upload_on_gcp_bucket(storage_client)
  parse = parse_file(path)
  
  path >> parse
  
essencepascherDag()