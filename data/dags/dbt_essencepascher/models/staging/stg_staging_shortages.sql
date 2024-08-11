{{ 
    config(
        materialized='table',
        indexes=[
          {'columns': ['station_id'], 'type': 'btree'},
        ]
    ) 
}}


with source as (
  select *
  from {{ source('staging', 'shortages') }}
),

renamed_shortages as (
  select 
    station_id::int,
    LOWER(fuel_name)::varchar(30) as fuel_name,
    fuel_id::int,
    start_shortage::timestamp,
    end_shortage::varchar(255),
    type
  from source
),

final as (
  select
    station_id,
    json_agg(jsonb_build_object(
      'fuel_name', fuel_name,
      'fuel_id', fuel_id,
      'start_shortage', start_shortage,
      'end_shortage', end_shortage,
      'type', type
    )) as json_shortages
  FROM
    renamed_shortages
  group by station_id
)

select *
from final