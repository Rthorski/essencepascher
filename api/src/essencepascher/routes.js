const { Router } = require("express");
const { getStations, getLastPrice } = require("./controllers");

const router = Router();

router.get("/", getStations);
router.post("/lastprice", getLastPrice);

module.exports = router;
