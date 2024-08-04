{{ config (materialized='table')}}

with source as (
  select *
  from {{ source('staging', 'opening_hours') }}
),

renamed_opening_hours as (
select
  station_id::int,
  day_id::int,
  day::varchar(20),
  COALESCE(is_closed, '0')::bool AS is_closed,
	REPLACE(opening_time, '.', ':') AS opening_time,
	REPLACE (closing_time, '.', ':') AS closing_time
FROM source
),

final as (
  select
    station_id,
    json_agg(jsonb_build_object(
      'day_id', day_id,
      'day', day,
      'is_closed', is_closed,
      'opening_time', opening_time,
      'closing_time', closing_time
    )) as json_opening_hours
  from renamed_opening_hours
  group by station_id
)

select *
from final