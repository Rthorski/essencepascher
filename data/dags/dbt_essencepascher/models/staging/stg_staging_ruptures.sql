{{ config (materialized='table')}}

with source as (
  select *
  from {{ source('staging', 'ruptures')}}
),

renamed as (
  select 
    station_id::int,
    LOWER(nom)::varchar(30) as nom,
    id::int,
    debut::timestamp,
    fin::varchar(255),
    type
  from source
),

final as (
  select
    station_id,
    json_agg(jsonb_build_object(
      'nom', nom,
      'id', id,
      'debut', debut,
      'fin', fin,
      'type', type
    )) as json_ruptures
  FROM
    renamed
  group by station_id
)

select *
from final