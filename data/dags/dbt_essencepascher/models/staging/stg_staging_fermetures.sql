{{ config (materialized='table')}}

with source as (
      select * from {{ source('staging', 'fermetures') }}
),
renamed as (
    select
        station_id::int,
        type,
        debut::timestamp,
        fin
    from source
)


select * from renamed
  