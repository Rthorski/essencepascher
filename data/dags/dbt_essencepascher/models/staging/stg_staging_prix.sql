{{
    config(
        materialized='incremental',
        on_schema_change='append_new_columns',
    )
}}

select
    LOWER(nom) as nom,
    id::int,
    maj::timestamp,
    valeur::float,
    station_id::int,
    injected_at::timestamp,
    price_id::int
from {{ source('staging', 'prix') }}
{% if is_incremental() %}
  where
      injected_at > (select max(injected_at) from {{this}})
{% endif %}