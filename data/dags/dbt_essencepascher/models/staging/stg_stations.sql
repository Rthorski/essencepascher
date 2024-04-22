with stations as (
select
  id::int,
  latitude::float,
  longitude::float,
  cp::varchar(5),
  lower(pop) as pop,
  lower(adresse) as adresse,
  lower(ville) as ville

from 
{{  source('staging', 'stations') }}
)

select
  *,
  CURRENT_TIMESTAMP as created_at
from
  stations