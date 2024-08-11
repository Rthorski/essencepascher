FROM apache/airflow:2.8.4

USER root
RUN apt-get -y update && \ 
    apt-get install -y gcc python3-dev libpq-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt /requirements.txt
USER airflow
RUN pip install --user --no-cache-dir -r /requirements.txt

RUN mkdir -p /opt/airflow/config
RUN mkdir -p /opt/airflow/logs
RUN mkdir -p /opt/airflow/plugins

COPY ./dags /opt/airflow/dags
COPY ./plugins /opt/airflow/plugins 
COPY ./logs /opt/airflow/logs
COPY ./config /opt/airflow/config

EXPOSE 8080 8081
