const activityDatas = require("../controllers/activity.controller.js");
const router = require("express").Router();

// Create a new activity data
router.post("/create", activityDatas.create);

// Retrieve all activity data with creator
router.get("/findById/:id", activityDatas.findAllBySellerOrBuyer);

// Retrieve all activity data with creator
router.get("/findByMintAddr/:id", activityDatas.findByMintAddr);

// Delete all activity data
router.delete("/", activityDatas.deleteAll);

module.exports = (app) => {
  app.use("/activity", router);
};
