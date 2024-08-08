require("dotenv").config();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

async function getPredictionsAutoComplete(req, res) {
  const query = req.query.input;

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.predictions);
  } catch (error) {
    console.error("Error fetching autocomplete:", error);
    res.status(500).json({ error: "Error fetching autocomplete" });
  }
}

async function getLatLongFromPlaceId(req, res) {
  const placeId = req.query.place_id;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.result);
  } catch (error) {
    console.error("Error fetching place details:", error);
    res.status(500).send("Error fetching place details");
  }
}

module.exports = {
  getPredictionsAutoComplete,
  getLatLongFromPlaceId,
};
