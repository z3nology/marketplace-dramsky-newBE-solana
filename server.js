const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(fileUpload());

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));

const db = require("./models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!❤️");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Dramsky Database.❤️" });
});

app.get("/public/assets/imgs/:imgName", (req, res) => {
  const imgPath = path.join(
    __dirname,
    "/public/assets/imgs/",
    req.params.imgName
  );
  console.log(imgPath); // Log the path to the console to help with debugging

  res.sendFile(imgPath);
});

require("./routes/listednfts.routes")(app);
require("./routes/userprofile.routes")(app);
require("./routes/activity.routes.js")(app);
require("./routes/offer.routes.js")(app);
require("./routes/redeem.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
