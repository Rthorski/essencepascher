const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const stationsRoutes = require("./src/essencepascher/stations/routes");
const graphsRoutes = require("./src/essencepascher/charts/routes");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:4200",
  })
);

app.get("/", (req, res) => {
  res.send("ok");
});

app.use("/api/v1/essencepascher/stations", stationsRoutes);
app.use("/api/v1/essencepascher/charts", graphsRoutes);

app.listen(port, () => console.log(`app listening on port ${port}`));
