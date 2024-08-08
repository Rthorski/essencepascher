const { Router } = require("express");
const router = Router();
const {
  getPredictionsAutoComplete,
  getLatLongFromPlaceId,
} = require("./controllers");

router.get("/autocomplete", getPredictionsAutoComplete);

router.get("/place-details", getLatLongFromPlaceId);

module.exports = router;
