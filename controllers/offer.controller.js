const db = require("../models");
const OfferDatas = db.offerDatas;
const ActivityDatas = db.activityDatas;
const ListedNfts = db.listedNfts;

const anchor = require("@project-serum/anchor");
const devnetEndpoint = "https://api.devnet.solana.com";
const solConnection = new anchor.web3.Connection(devnetEndpoint);

// Confirm the list transaction
async function sendTransaction(transaction) {
  const options = {
    commitment: "confirmed",
    skipPreflight: false,
  };
  return await solConnection.sendRawTransaction(transaction, options);
}

// Create and save a new OfferDatas
exports.create = async (req, res) => {
  const { transaction, offerData } = req.body;

  try {
    // Send and confirm transaction
    const txId = await sendTransaction(transaction);
    await solConnection.confirmTransaction(txId, "finalized");

    // Create ListedNfts document with new prices and timestamps
    const offerDatas = new OfferDatas({
      imgUrl: offerData.imgUrl,
      tokenId: offerData.tokenId,
      listedNftId: offerData.listedNftId,
      offerPrice: offerData.offerSolPrice || offerData.offerTokenPrice,
      collectionAddr: offerData.collectionAddr,
      byToken: offerData.offerSolPrice !== 0 ? false : true,
      royalty: 5,
      expiresAt: offerData.expiresAt,
      mintAddr: offerData.mintAddr,
      seller: offerData.seller,
      buyer: offerData.buyer,
      active: 1,
    });
    await offerDatas.save();

    // Create activity data and save to database
    const activityData = new ActivityDatas({
      imgUrl: offerData.imgUrl,
      tokenId: offerData.tokenId,
      mintAddr: offerData.mintAddr,
      txType: offerData.txType,
      solPrice: offerData.offerSolPrice,
      tokenPrice: offerData.offerTokenPrice,
      seller: offerData.seller,
      buyer: offerData.buyer,
    });
    const createdListing = await activityData.save();

    res.send({
      message: "ListedNfts was updated successfully.",
      data: createdListing,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Some error occurred while updating the price",
      error: error.message,
    });
  }
};

exports.findAllByMintAddr = async (req, res) => {
  try {
    const mintAddr = req.params.id;
    // Find all offer datas with matching mint address
    const offerDatas = await OfferDatas.find({ mintAddr: mintAddr });

    if (!offerDatas) {
      return res.status(404).send({
        message: "Offer data not found with this mintaddr",
      });
    }

    // Find all listed NFTs with matching mint address
    const listedNfts = await ListedNfts.find({ mintAddr: mintAddr });
    // Combine the offer datas and listed NFTs into a single array
    const result = offerDatas.map((offerData) => {
      const matchingListedNft = listedNfts.find(
        (listedNft) => listedNft.mintAddr === offerData.mintAddr
      );

      return {
        ...offerData.toJSON(),
        solPrice:
          matchingListedNft === undefined ? 0 : matchingListedNft.solPrice,
        tokenPrice:
          matchingListedNft === undefined ? 0 : matchingListedNft.tokenPrice,
      };
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message:
        error.message ||
        "Error occurred while retrieving offer datas by mintAddr",
    });
  }
};

// Retrieve all offer datas from the database for a specific seller.
exports.findAllBySeller = async (req, res) => {
  try {
    const seller = req.params.id;
    // Find all offer datas with matching seller address
    const offerDatas = await OfferDatas.find({ seller: seller });

    if (!offerDatas.length) {
      return res.status(200).send([]);
    }

    // Find all listed NFTs with matching seller address
    const allListedNfts = await ListedNfts.find({});
    console.log("lisedNfts", allListedNfts);

    // Combine the offer datas and listed NFTs into a single array
    const result = offerDatas.map((offerData) => {
      const matchingListedNft = allListedNfts.find(
        (listedNft) => listedNft.seller === offerData.seller
      );
      console.log("matchingListedNft", matchingListedNft);

      return {
        ...offerData.toObject(),
        solPrice: matchingListedNft?.solPrice || 0,
        tokenPrice: matchingListedNft?.tokenPrice || 0,
      };
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message:
        error.message ||
        "Error occurred while retrieving offer datas by seller",
    });
  }
};

// Retrieve all offer datas from the database for a specific buyer.
exports.findAllByBuyer = async (req, res) => {
  try {
    const buyer = req.params.id;
    // Find all offer datas with matching buyer address
    const offerDatas = await OfferDatas.find({ buyer: buyer });

    if (!offerDatas.length) {
      return res.status(200).send([]);
    }

    // Find all listed NFTs with matching buyer address
    const allListedNfts = await ListedNfts.find({});

    // Combine the offer datas and listed NFTs into a single array
    const result = offerDatas.map((offerData) => {
      const matchingListedNft = allListedNfts.find(
        (listedNft) => listedNft.mintAddr === offerData.mintAddr
      );

      return {
        ...offerData.toObject(),
        solPrice: matchingListedNft?.solPrice || 0,
        tokenPrice: matchingListedNft?.tokenPrice || 0,
      };
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Error occurred while retrieving offer datas by buyer",
    });
  }
};

// Find a single OfferData with highest offer price
exports.findHighOffer = async (req, res) => {
  try {
    const { mintAddr } = req.params;
    const offerData = await OfferDatas.findOne({ mintAddr }).sort({
      offerPrice: -1,
    });
    if (!offerData) {
      res.status(404).send({ message: "Offer data not found" });
    } else {
      res.send(offerData);
    }
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error occurred while retrieving offer datas",
    });
  }
};

// Find a single OfferData with highest offer price
exports.findByOfferMaker = async (req, res) => {
  try {
    const { mintAddr, buyer } = req.params;
    const offerData = await OfferDatas.findOne({
      mintAddr: mintAddr,
      buyer: buyer,
    });
    if (!offerData) {
      res.status(404).send({ message: "Offer data not found" });
    } else {
      res.send(offerData);
    }
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error occurred while retrieving offer datas",
    });
  }
};

// Accept offer and Delete the offer data
exports.acceptoffer = async (req, res) => {
  const { mintAddr, offerData, transaction } = req.body;
  console.log("mintAddr", mintAddr);
  console.log("offerData", offerData);
  console.log("transaction", transaction);

  try {
    // Send and confirm transaction
    const txId = await sendTransaction(transaction);
    await solConnection.confirmTransaction(txId, "finalized");

    // Delete the made offer
    const deletedOfferData = await OfferDatas.findOneAndDelete({
      mintAddr: mintAddr,
      buyer: offerData.buyer,
    });

    const deletedListedData = await ListedNfts.findOneAndDelete({
      mintAddr: mintAddr,
      seller: offerData.seller,
    });

    // Update all offers where `mintAddr` is same and `buyer` is different
    const offerUpdateData = await OfferDatas.updateMany(
      { mintAddr: mintAddr, buyer: { $ne: offerData.buyer } },
      { $set: { active: 0 } }
    );

    if (!deletedOfferData) {
      return res.status(404).send({
        message: `Cannot delete OfferDatas with mintAddr=${mintAddr}. Maybe OfferDatas was not found!`,
      });
    }

    if (!deletedListedData) {
      return res.status(404).send({
        message: `Cannot delete OfferDatas with mintAddr=${mintAddr}. Maybe ListedData was not found!`,
      });
    }

    if (!offerUpdateData) {
      return res.status(404).send({
        message: `Cannot update OfferDatas with mintAddr=${mintAddr}. Maybe ListedData was not found!`,
      });
    }

    // Create activity data and save to database
    const activityData = new ActivityDatas({
      imgUrl: offerData.imgUrl,
      tokenId: offerData.tokenId,
      mintAddr: offerData.mintAddr,
      txType: offerData.txType,
      solPrice: offerData.solPrice,
      tokenPrice: offerData.tokenPrice,
      seller: offerData.seller,
      buyer: offerData.buyer,
    });
    const createdListing = await activityData.save();

    res.send({
      message:
        "OfferDatas was deleted successfully and ListedNfts was updated.",
      data: createdListing,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        "Some error occurred while deleting the offer or updating the ListedNfts",
      error: error.message,
    });
  }
};

// Cancel offer and Delete the offer data
exports.canceloffer = async (req, res) => {
  const { mintAddr, offerData, transaction } = req.body;

  console.log("mintAddr", mintAddr);

  try {
    // Send and confirm transaction
    const txId = await sendTransaction(transaction);
    console.log("txid", txId);
    await solConnection.confirmTransaction(txId, "finalized");

    // Delete the made offer
    const deletedOfferData = await OfferDatas.findOneAndDelete({
      mintAddr: mintAddr,
      buyer: offerData.buyer,
    });

    if (!deletedOfferData) {
      return res.status(404).send({
        message: `Cannot delete OfferDatas with mintAddr=${mintAddr}. Maybe OfferDatas was not found!`,
      });
    }

    // Create activity data and save to database
    const activityData = new ActivityDatas({
      imgUrl: offerData.imgUrl,
      tokenId: offerData.tokenId,
      mintAddr: offerData.mintAddr,
      txType: offerData.txType,
      solPrice: offerData.solPrice,
      tokenPrice: offerData.tokenPrice,
      seller: offerData.seller,
      buyer: offerData.buyer,
    });
    const createdListing = await activityData.save();

    res.send({
      message:
        "OfferDatas was deleted successfully and ListedNfts was updated.",
      data: createdListing,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        "Some error occurred while deleting the offer or updating the ListedNfts",
      error: error.message,
    });
  }
};

// Delete all OfferDatas from the database
exports.deleteAll = async (req, res) => {
  try {
    const deletedOfferDatas = await OfferDatas.deleteMany();
    res.send({
      message: `${deletedOfferDatas.deletedCount} offer datas were deleted successfully.`,
    });
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Error occurred while deleting all offer datas.",
    });
  }
};
