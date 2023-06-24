module.exports = (app) => {
  const userProfileDatas = require("../controllers/userprofile.controller.js");
  var router = require("express").Router();

  // Create a new user data
  router.post("/create", userProfileDatas.create);

  // Retrieve a single  user data with id
  router.get("/:id", userProfileDatas.findOne);

  // Delete a  user data with id
  router.delete("/:id", userProfileDatas.delete);

  // Delete all user data
  router.delete("/", userProfileDatas.deleteAll);

  app.use("/userprofile", router);
};
