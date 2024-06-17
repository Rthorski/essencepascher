const { Router } = require("express");
const {
  getStations,
  getLastPrice,
  getLastPriceFiltered,
} = require("./controllers");

const router = Router();

router.get("/", getStations);
router.post("/lastpriceFiltered", getLastPriceFiltered);
router.get("/lastprice", getLastPrice);

module.exports = router;
