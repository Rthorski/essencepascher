from airflow.decorators import dag, task
import datetime
from essencepascherDag.downloadAndUploadFiles.downloadAndUploadFiles import uploadOnGcpBucket



@dag(start_date=datetime.datetime(2024, 1, 1), schedule=None, catchup=False)
def essencepascherDag():
  
  @task
  def upload_on_gcp_bucket():
    
    return uploadOnGcpBucket()
  
  upload = upload_on_gcp_bucket()
  
essencepascherDag()