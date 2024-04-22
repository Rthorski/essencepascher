with services as (
select
  lower(service) as nom_service,
  station_id::int
from 
{{  source('staging', 'services') }}
)

select
  *,
  CURRENT_TIMESTAMP as created_at
from
  services