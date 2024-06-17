const pool = require("../../db");
const queries = require("./queries");

async function getStations(req, res) {
  try {
    const result = await pool.query(queries.getStations);
    res.send(result.rows);
  } catch (error) {
    console.log("error:", error);
  }
}

async function getLastPrice(req, res) {
  try {
    const result = await pool.query(queries.getLastPrice);
    res.send(result.rows);
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
    const { rows } = await pool.query(queries.getLastPrice, [station_id]);
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
};
