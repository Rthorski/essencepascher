{{ config (materialized='table')}}

with source as (
      select * from {{ source('staging', 'stations') }}
),
renamed_stations as (
    select
        id::int,
        latitude::float / 100000 as latitude,
        longitude::float / 100000 as longitude,
        lower(address) as address,
        postal_code,
        population,
        lower(city) as city
    from source
),

final as (
    select
        id,
        json_agg(jsonb_build_object(
            'latitude', latitude,
            'longitude', longitude,
            'postal_code', postal_code,
            'population', population,
            'address', address,
            'city', city

        )) as geolocalisation
    FROM
        renamed_stations as r
    group by id
)
select * from final
  