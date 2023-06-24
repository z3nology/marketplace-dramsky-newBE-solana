const redeemDatas = require("../controllers/redeem.controller.js");
const router = require("express").Router();

// Create a new redeem data
router.post("/create", redeemDatas.create);

// Delete all redeem data
router.delete("/", redeemDatas.deleteAll);

module.exports = (app) => {
  app.use("/redeem", router);
};
