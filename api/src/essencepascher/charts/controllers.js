const pool = require("../../../db");
const queries = require("./queries");

async function getMartOneYearPriceTrend(req, res) {
  try {
    const { rows } = await pool.query(queries.getMartOneYearPriceTrend);
    res.json(rows);
  } catch (error) {
    console.log("error:", error);
  }
}

async function getMartOneYearYtd(req, res) {
  try {
    const { rows } = await pool.query(queries.getMartOneYearYtd);
    res.json(rows);
  } catch (error) {
    console.log("error:", error);
  }
}

module.exports = {
  getMartOneYearPriceTrend,
  getMartOneYearYtd,
};
