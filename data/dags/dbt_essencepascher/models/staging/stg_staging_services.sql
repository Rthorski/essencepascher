{{ config (materialized='table')}}

with source as (
select *
from {{ source('staging', 'services')}}
),

renamed as (
  select
    station_id::int,
    json_agg(service) as json_services
  from source
  group by station_id
)

select *
from renamed

