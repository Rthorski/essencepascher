{{ config (materialized='table') }}

WITH prices AS (
SELECT
	ssp.*,
	TO_CHAR(fuel_updated_at,
	'YYYY-MM-DD') AS year_month_day
FROM
	"essencepascher_db"."staging"."stg_staging_prices" ssp
WHERE fuel_updated_at >= current_date - INTERVAL '1 year'
AND fuel_updated_at < current_date

),

	
groupby_date_name AS (
SELECT
	year_month_day,
	name,
	round(avg(value)::NUMERIC, 3) AS avg_fuel
FROM
	prices
GROUP BY
	year_month_day,
	name
ORDER BY
	year_month_day)
	
SELECT *
FROM groupby_date_name