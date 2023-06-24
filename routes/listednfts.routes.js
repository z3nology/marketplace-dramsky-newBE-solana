module.exports = (app) => {
  const listedData = require("../controllers/listednfts.controller.js");
  var router = require("express").Router();

  // Create a new listed data
  router.post("/create", listedData.create);

  // Retrieve all listed data
  router.get("/findAllBySeller/:id", listedData.findAllBySeller);

  // Retrieve all listed data
  router.get("/findByCollectionAddr/:id", listedData.findByCollectionAddr);

  // Retrieve a single listed data with id
  router.get("/:mintAddr", listedData.findOne);

  // Retrieve all listed data
  router.get("/", listedData.findAll);

  // Update a listed data with id
  router.put("/", listedData.update);

  // Delete a listed data with id
  router.delete("/deletewithmintaddr/:mintAddr", listedData.delete);

  // Delete a listed data with array
  router.delete("/", listedData.deleteListedNfts);

  // Delete a listed data with array to purchase
  router.delete("/purchase", listedData.purchaseListedNfts);

  // Delete all listed data
  router.delete("/deleteall", listedData.deleteAll);

  app.use("/listednfts", router);
};
