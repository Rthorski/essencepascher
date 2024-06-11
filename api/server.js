const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const stationsRoutes = require("./src/essencepascher/routes");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/v1/essencepascher/stations", stationsRoutes);

app.listen(port, () => console.log(`app listening on port ${port}`));
