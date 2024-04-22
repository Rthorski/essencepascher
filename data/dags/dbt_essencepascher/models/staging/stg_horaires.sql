with horaires as (
select
  id::int,
  lower(nom) as jour_de_la_semaine,
  COALESCE(ferme::boolean, FALSE) as is_closed,
  REPLACE(ouverture, '.', ':') as ouverture,
  REPLACE(fermeture, '.', ':') as fermeture,
  station_id::int
from 
{{  source('staging', 'horaires') }}
)

select
  *,
  CURRENT_TIMESTAMP as created_at
from
  horaires