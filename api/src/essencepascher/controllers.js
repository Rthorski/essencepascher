const pool = require("../../db");
const queries = require("./queries");
const geolib = require("geolib");

async function getStations() {
  try {
    const result = await pool.query(queries.getStations);
    return result.rows;
  } catch (error) {
    console.log("error:", error);
  }
}

async function test(req, res) {
  const { latitude, longitude, radius } = req.query;

  if (!latitude || !longitude || !radius) {
    return res.status(400).send("Invalid parameters");
  }

  const userLocation = {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  };
  const stations = await getLastPrice();
  const nearbyStations = stations.filter((station) =>
    geolib.isPointWithinRadius(
      {
        latitude: station.geolocalisation[0].latitude,
        longitude: station.geolocalisation[0].longitude,
      },
      userLocation,
      parseInt(radius)
    )
  );
  res.json(nearbyStations);
}

async function getLastPrice(req, res) {
  try {
    const result = await pool.query(queries.getLastPrice);
    return result.rows;
  } catch (error) {
    console.log("error:", error);
  }
}

async function getLastPriceFiltered(req, res) {
  const { station_id } = req.body;

  if (!station_id) {
    return res.status(400).send("Invalid station_ids");
  }
  try {
    const { rows } = await pool.query(queries.getLastPriceFiltered, [
      station_id,
    ]);
    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des prix :", error);
    res.status(500).send("Erreur serveur");
  }
}

module.exports = {
  getStations,
  getLastPrice,
  getLastPriceFiltered,
  test,
};
