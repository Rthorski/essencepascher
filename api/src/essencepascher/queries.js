const getStations = "SELECT * FROM staging.stg_staging_stations";
const getLastPrice = `
SELECT *
FROM staging.mart_last_price_with_all_tables
WHERE id = ANY($1)
`;

module.exports = {
  getStations,
  getLastPrice,
};
