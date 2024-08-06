{{ config (materialized='table') }}


WITH mart_one_year_ytd AS (
SELECT
	*
FROM
	"essencepascher_db"."marts"."mart_one_year_price_trend" ssp
WHERE date_series >= '2024-01-01'
)

SELECT *
FROM mart_one_year_ytd