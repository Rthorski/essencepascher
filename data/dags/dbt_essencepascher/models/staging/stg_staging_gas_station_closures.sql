{{ config (materialized='table') }}

with source as (
      select * from {{ source('staging', 'gas_station_closures') }}
),
renamed_gas_station_closures as (
    select
        station_id::int,
        type,
        start_closure::timestamp,
        end_closure
    from source
)


select * from renamed_gas_station_closures
  