const { Router } = require("express");
const {
  getStations,
  getLastPrice,
  getLastPriceFiltered,
  getNearbyStations,
  getStationNames,
} = require("./controllers");

const router = Router();

router.get("/", getStations);

router.post("/lastpriceFiltered", getLastPriceFiltered);

router.get("/lastprice", getLastPrice);

router.get("/getNearbyStations", getNearbyStations);

router.get("/name/:id", getStationNames);

module.exports = router;
