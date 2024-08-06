{{ config (materialized='table') }}

WITH prices AS (
SELECT
	ssp.*,
	TO_CHAR(fuel_updated_at,
	'YYYY-MM-DD') AS year_month_day
FROM
	"essencepascher_db"."staging"."stg_staging_prices" ssp
WHERE
fuel_updated_at >= current_date - INTERVAL '1 year'
AND fuel_updated_at < current_date),

avg_gazole AS (SELECT year_month_day, avg(value) AS avg_gazole
FROM prices
WHERE name = 'gazole'
GROUP BY year_month_day),

avg_e10 AS (SELECT year_month_day, avg(value) AS avg_e10
FROM prices
WHERE name = 'e10'
GROUP BY year_month_day),

avg_e85 AS (SELECT year_month_day, avg(value) AS avg_e85
FROM prices
WHERE name = 'e85'
GROUP BY year_month_day),

avg_sp95 AS (SELECT year_month_day, avg(value) AS avg_sp95
FROM prices
WHERE name = 'sp95'
GROUP BY year_month_day),

avg_sp98 AS (SELECT year_month_day, avg(value) AS avg_sp98 
FROM prices
WHERE name = 'sp98'
GROUP BY year_month_day),

avg_gplc AS (SELECT year_month_day, avg(value) AS avg_gplc
FROM prices
WHERE name = 'gplc'
GROUP BY year_month_day),

range_one_year AS (
SELECT
	to_char(generate_series(
           (current_date - INTERVAL '1 year')::date,
	(current_date - INTERVAL '1 day')::date,
	INTERVAL '1 day'), 'YYYY-MM-DD') AS date_series 
ORDER BY
	date_series DESC)

SELECT
	r.date_series,
	round(g.avg_gazole::NUMERIC, 3) AS avg_gazole,
	round(spp.avg_sp98::numeric,3) AS avg_sp98,
	round(sp.avg_sp95::NUMERIC, 3) AS avg_sp95,
	round(e.avg_e10::numeric,3) AS avg_e10,
	round(ee.avg_e85::NUMERIC, 3) AS avg_e85,
	round(gplc.avg_gplc::NUMERIC, 3) AS avg_glc
FROM
	range_one_year r
LEFT JOIN avg_gazole g ON g.year_month_day = r.date_series
LEFT JOIN avg_sp98 spp ON spp.year_month_day = r.date_series
LEFT JOIN avg_sp95 sp ON sp.year_month_day = r.date_series
LEFT JOIN avg_e10 e ON e.year_month_day = r.date_series
LEFT JOIN avg_e85 ee ON ee.year_month_day = r.date_series
LEFT JOIN avg_gplc gplc ON gplc.year_month_day = r.date_series