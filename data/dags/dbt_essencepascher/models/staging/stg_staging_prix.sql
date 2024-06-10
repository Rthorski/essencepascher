{{
    config(
        materialized='incremental',
        on_schema_change='append_new_columns',
        indexes=[
            {'columns': ['injected_at'], 'type': 'btree'},
            {'columns': ['station_id'], 'type': 'btree'},
        ]
    )
}}


with source as (
      select * from {{ source('staging', 'prix') }}
),

renamed as (
    select
        LOWER(nom) as nom,
        id::int,
        maj::timestamp,
        valeur::float,
        station_id::int,
        injected_at::timestamp,
        price_id::int
    from source
)
select
    r.*,
    CAST(now() as timestamp without time zone) as created_at
from 
    renamed as r
{% if is_incremental() %}

where
  r.injected_at > (select max(injected_at) from {{this}})

{% endif %}