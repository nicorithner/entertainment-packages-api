const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

// Sequelize
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "node_express_api_dev",
  "postgres",
  "postgres",
  {
    host: "localhost",
    dialect: "postgres",
  }
);

// express
const app = express();

// db
const db = require("./db/models");
db.sequelize.sync(); // commented while using force: true to reset every time.

/* --- To drop and re-sync db everytime
 * comment out line above and
 * and uncomment the snippet below
 */

// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

//--- middlewares
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// cors
const corsOptions = {
  origin: [process.env.CLIENT_URL],
};
app.use(cors(corsOptions));

// morgan
app.use(morgan("dev"));

// routes
const packageRoutes = require("./routes/api/v1/package.routes");
const networkRoutes = require("./routes/api/v1/network.routes");
const showRoutes = require("./routes/api/v1/show.routes");
const packageNetworkRoutes = require("./routes/api/v1/packageNetwork.routes");
const swaggerRoute = require("../swagger.js");

packageRoutes(app);
networkRoutes(app);
showRoutes(app);
packageNetworkRoutes(app);
swaggerRoute(app);

app.get("/", async (_req, res) => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  res.status(200).send({ message: "Hello, World!, with sequelize" });
});

// Port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
