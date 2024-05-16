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

module.exports = {
  getStations,
};
