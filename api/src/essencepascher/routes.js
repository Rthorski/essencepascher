const { Router } = require("express");
const {
  getStations,
  getLastPrice,
  getLastPriceFiltered,
  test,
} = require("./controllers");

const router = Router();

router.get("/", getStations);
router.post("/lastpriceFiltered", getLastPriceFiltered);
router.get("/lastprice", getLastPrice);
router.get("/test", test);

module.exports = router;
