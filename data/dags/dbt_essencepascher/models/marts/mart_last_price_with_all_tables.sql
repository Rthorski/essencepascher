{{ config (materialized='table') }}

with stations as (
  select *
  from "essencepascher_db"."staging"."stg_staging_stations" as ss
  LEFT join {{ source('staging', 'stations_name') }} as sn 
  on ss.id = sn.station_id::int
),

ruptures as (
  select *
  from "essencepascher_db"."staging"."stg_staging_ruptures"
),

fermetures as (
  select *
  from "essencepascher_db"."staging"."stg_staging_fermetures"
),

fermetures_without_definitive as (
  select *
  from fermetures as f
  where f.type != 'D' 
),

fermetures_final as (
    SELECT
        station_id,
        json_agg(jsonb_build_object(
            'type', type,
            'debut', debut,
            'fin', fin
        )) as json_fermetures
    from fermetures_without_definitive
    group by station_id
),

prix as (
  select *,
  ROW_NUMBER () OVER (PARTITION BY station_id, id ORDER BY station_id, id, maj desc) as last_price_rank
  from "essencepascher_db"."staging"."stg_staging_prix"
),

prix_with_last_price as (
  select *
  from prix as p
  where last_price_rank = 1
),

prix_final as (
  select 
    station_id,
    json_agg(jsonb_build_object(
      'nom', nom,
      'id', id,
      'maj', maj,
      'valeur', valeur,
      'price_id', price_id
    )) as json_prix
  FROM
    prix_with_last_price
  group by station_id
),

services as (
  select *
  from "essencepascher_db"."staging"."stg_staging_services"
),

horaires as (
  select *
  from "essencepascher_db"."staging"."stg_staging_horaires"
),


all_tables as (
  select 
    s.id,
    s.name,
    s.geolocalisation,
    f.json_fermetures,
    p.json_prix,
    se.json_services,
    h.json_horaires,
    r.json_ruptures
  from stations as s
  left join fermetures_final as f on s.id = f.station_id
  left join prix_final as p on p.station_id = s.id
  left join services as se on se.station_id = s.id
  left join horaires as h on h.station_id = s.id
  left join ruptures as r on r.station_id = s.id
  where p.json_prix NOTNULL
) 

select *
from all_tables