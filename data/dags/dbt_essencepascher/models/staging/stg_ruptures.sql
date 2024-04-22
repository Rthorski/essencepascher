with ruptures as (
select
  lower(nom) as nom,
  id::int as carburant_id,
  debut::timestamp,
  fin::timestamp,
  type::text,
  station_id::int

from 
{{  source('staging', 'ruptures') }}
)

select
  *,
  CURRENT_TIMESTAMP as created_at
from
  ruptures