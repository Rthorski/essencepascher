const getMartOneYearPriceTrend =
  "SELECT * FROM marts.mart_one_year_price_trend";

const getMartOneYearYtd = "SELECT * FROM marts.mart_ytd_price_trend";

module.exports = {
  getMartOneYearPriceTrend,
  getMartOneYearYtd,
};
