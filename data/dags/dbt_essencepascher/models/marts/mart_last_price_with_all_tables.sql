{{ config (materialized='table') }}

with stations as (
  select *
  from "essencepascher_db"."staging"."stg_staging_stations" as ss
  LEFT join {{ source('staging', 'stations_name') }} as sn 
  on ss.id = sn.station_id::int
),

shortages as (
  select *
  from "essencepascher_db"."staging"."stg_staging_shortages"
),

gas_station_closures as (
  select *
  from "essencepascher_db"."staging"."stg_staging_gas_station_closures"
),

gas_station_closures_without_definitive as (
  select *
  from gas_station_closures as f
  where f.type != 'D' 
),

gas_station_closures_final as (
    SELECT
        station_id,
        json_agg(jsonb_build_object(
            'type', type,
            'start_closure', start_closure,
            'end_closure', end_closure
        )) as json_gas_station_closures
    from gas_station_closures_without_definitive
    group by station_id
),

prices as (
  select *,
  ROW_NUMBER () OVER (PARTITION BY station_id, id ORDER BY station_id, id, fuel_updated_at desc) as last_prices_rank
  from "essencepascher_db"."staging"."stg_staging_prices"
),

prices_with_last_prices as (
  select *
  from prices as p
  where last_prices_rank = 1
),

prices_final as (
  select 
    station_id,
    json_agg(jsonb_build_object(
      'name', name,
      'id', id,
      'fuel_updated_at', fuel_updated_at,
      'value', value,
      'price_id', price_id
    )) as json_prices
  FROM
    prices_with_last_prices
  group by station_id
),

services as (
  select *
  from "essencepascher_db"."staging"."stg_staging_services"
),

opening_hours as (
  select *
  from "essencepascher_db"."staging"."stg_staging_opening_hours"
),


all_tables as (
  select 
    s.id,
    s.name,
    s.geolocalisation,
    f.json_gas_station_closures,
    p.json_prices,
    se.json_services,
    h.json_opening_hours,
    r.json_shortages
  from stations as s
  left join gas_station_closures_final as f on s.id = f.station_id
  left join prices_final as p on p.station_id = s.id
  left join services as se on se.station_id = s.id
  left join opening_hours as h on h.station_id = s.id
  left join shortages as r on r.station_id = s.id
  where p.json_prices NOTNULL
) 

select *
from all_tables