const pool = require("../../../db");
const queries = require("./queries");
const geolib = require("geolib");
require("dotenv").config();

async function getStationNames(req, res) {
  try {
    let { id } = req.params;
    id = parseInt(id);

    const { rows } = await pool.query(queries.getStationNames, [id]);

    const station = rows[0];

    if (!station) {
      return res.status(404).send("Station not found");
    }

    const { latitude, longitude } = station.geolocalisation[0];

    if (!station.name) {
      let response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude}%2C${longitude}&radius=100&type=gas_station&key=${process.env.GOOGLE_API_KEY}`
      );
      let data = await response.json();
      if (data && data["results"]) {
        const namesResults = data.results
          .map((result) => result.name)
          .filter((name) => name);
        const namesResultsJoin = namesResults.join(" & ");
        const nameToUpdate = namesResultsJoin || "station-service";
        await pool.query(queries.updateNameInStationsName, [nameToUpdate, id]);
        await pool.query(queries.updateNameInMartLastPrice, [nameToUpdate, id]);
        const updateRowResult = await pool.query(
          queries.getRowsUpdateInMartLastPrice,
          [id]
        );
        res.json(updateRowResult.rows);
      }
    } else {
      res.json(station);
    }
  } catch (error) {
    console.log("error:", error);
    res.status(500).send("Erreur serveur");
  }
}

async function getStations(req, res) {
  try {
    const { rows } = await pool.query(queries.getStations);
    res.json(rows);
  } catch (error) {
    console.log("error:", error);
    res.status(500).send("Erreur serveur");
  }
}

async function getNearbyStations(req, res) {
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
    res.status(500).send("Erreur lors de la récupération des prix");
  }
}

module.exports = {
  getStations,
  getLastPrice,
  getLastPriceFiltered,
  getNearbyStations,
  getStationNames,
};
