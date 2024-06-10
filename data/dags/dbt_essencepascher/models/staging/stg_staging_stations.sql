{{ config (materialized='table')}}

with source as (
      select * from {{ source('staging', 'stations') }}
),
renamed as (
    select
        id::int,
        latitude::float / 100000 as latitude,
        longitude::float / 100000 as longitude,
        cp as postal_code,
        pop,
        lower(adresse) as adresse,
        lower(ville) as town
    from source
),

final as (
    select
        id,
        json_agg(jsonb_build_object(
            'latitude', latitude,
            'longitude', longitude,
            'postal_code', postal_code,
            'pop', pop,
            'adresse', adresse,
            'town', town

        )) as geolocalisation
    FROM
        renamed as r
    group by id
)
select * from final
  