const { Router } = require("express");
const { getStations } = require("./controllers");

const router = Router();

router.get("/", getStations);

module.exports = router;
