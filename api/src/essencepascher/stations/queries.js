const getStations = "SELECT * FROM staging.stg_staging_stations";

const getLastPriceFiltered = `
SELECT *
FROM marts.mart_last_price_with_all_tables
WHERE id = ANY($1)
`;
const getLastPrice = "SELECT * FROM marts.mart_last_price_with_all_tables";

const updateNameInStationsName =
  "UPDATE dev.stations_name SET name = LOWER($1) WHERE station_id = $2";

const updateNameInMartLastPrice =
  "UPDATE marts.mart_last_price_with_all_tables SET name = LOWER($1) WHERE id = $2";

const getRowsUpdateInMartLastPrice =
  "SELECT * FROM marts.mart_last_price_with_all_tables WHERE id = $1";

const getStationNames =
  "SELECT * FROM marts.mart_last_price_with_all_tables WHERE id = $1";

module.exports = {
  getStations,
  getLastPriceFiltered,
  getLastPrice,
  updateNameInStationsName,
  updateNameInMartLastPrice,
  getRowsUpdateInMartLastPrice,
  getStationNames,
};
