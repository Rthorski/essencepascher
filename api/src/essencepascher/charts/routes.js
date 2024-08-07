const { Router } = require("express");
const router = Router();
const {
  getMartOneYearPriceTrend,
  getMartOneYearYtd,
} = require("./controllers");

router.get("/getMartOneYearPriceTrend", getMartOneYearPriceTrend);
router.get("/getMartOneYearYtd", getMartOneYearYtd);
module.exports = router;
