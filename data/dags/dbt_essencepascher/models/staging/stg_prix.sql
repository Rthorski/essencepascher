with prix as (
select
  lower(nom) as nom_carburant,
  id::int as carburant_id,
  maj,
  valeur::float,
  station_id::int
from 
{{  source('staging', 'prix') }}
)

select
  *,
  CURRENT_TIMESTAMP as created_at
from
  prix