{{ config (materialized='table')}}

with source as (
  select *
  from {{ source('staging', 'horaires') }}
),

renamed as (
select
  station_id::int,
  id::int,
  nom::varchar(20),
  COALESCE(ferme, '0')::bool AS ferme,
	REPLACE(ouverture, '.', ':') AS ouverture,
	REPLACE (fermeture, '.', ':') AS fermeture
FROM source
),

final as (
  select
    station_id,
    json_agg(jsonb_build_object(
      'id', id,
      'nom', nom,
      'ferme', ferme,
      'ouverture', ouverture,
      'fermeture', fermeture
    )) as json_horaires
  from renamed
  group by station_id
)

select *
from final