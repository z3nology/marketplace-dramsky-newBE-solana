module.exports = (app) => {
  const offerData = require("../controllers/offer.controller.js");
  var router = require("express").Router();

  // Create a new offer data
  router.post("/create", offerData.create);

  // Retrieve all offer data By Seller
  router.get("/findAllBySeller/:id", offerData.findAllBySeller);

  // Retrieve all offer data By Buyer
  router.get("/findAllByBuyer/:id", offerData.findAllByBuyer);

  // Retrieve all offer data By MintAddr
  router.get("/findAllByMintAddr/:id", offerData.findAllByMintAddr);

  // Retrieve offer data By MintAddr
  router.get("/findByOfferMaker/:mintAddr/:buyer", offerData.findByOfferMaker);

  // Retrieve a single offer data with id
  router.get("/findHighOffer/:mintAddr", offerData.findHighOffer);

  // Run the offer accept and cacel transaction and Delete a offer data with id
  router.delete("/acceptoffer", offerData.acceptoffer);

  // Run the offer accept and cacel transaction and Delete a offer data with id
  router.delete("/canceloffer", offerData.canceloffer);

  app.use("/offer", router);
};
