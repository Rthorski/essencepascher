{{
    config(
        materialized='incremental',
        on_schema_change='append_new_columns',
    )
}}

select
    LOWER(name) as name,
    id::int,
    fuel_updated_at::timestamp,
    value::float,
    station_id::int,
    injected_at::timestamp,
    price_id::int
from {{ source('staging', 'prices') }}
{% if is_incremental() %}
  where
      injected_at > (select max(injected_at) from {{this}})
{% endif %}