const db = require("../models");
const ListedNfts = db.listedNfts;
const ActivityDatas = db.activityDatas;
const OfferDatas = db.offerDatas;

const anchor = require("@project-serum/anchor");
const devnetEndpoint = "https://api.devnet.solana.com";
const solConnection = new anchor.web3.Connection(devnetEndpoint);

// Confirm the list transaction
async function sendTransaction(transaction) {
  const options = {
    commitment: "confirmed",
    skipPreflight: true,
  };
  const signature = await solConnection.sendRawTransaction(
    transaction,
    options
  );
  console.log("list signature: ", signature);
  return signature;
}

// Get ListedNftsArray function
function createListedNftsArray(listData) {
  return listData.map((data) => ({
    tokenId: data.tokenId,
    collectionAddr: data.collectionAddr,
    imgUrl: data.imgUrl,
    mintAddr: data.mintAddr,
    seller: data.seller,
    metaDataUrl: data.metaDataUrl,
    solPrice: data.solPrice,
    tokenPrice: data.tokenPrice,
  }));
}

// Get ActivityDataArray function
function createActivityDataArray(listData) {
  return listData.map((data) => ({
    imgUrl: data.imgUrl,
    tokenId: data.tokenId,
    mintAddr: data.mintAddr,
    txType: data.txType,
    solPrice: data.solPrice,
    tokenPrice: data.tokenPrice,
    seller: data.seller,
    buyer: data.buyer,
  }));
}

// Create and Save a new ListedNfts
exports.create = async (req, res) => {
  try {
    const txs = req.body.transactions;

    let signatures = await Promise.all(txs.map((tx) => sendTransaction(tx)));

    // const ret =
    await Promise.all(
      signatures.map((signature) =>
        solConnection.confirmTransaction(signature, "confirmed")
      )
    );
    // console.log(ret[0]);

    const listedNftsArray = createListedNftsArray(req.body.listData);
    const activityDatasArray = createActivityDataArray(req.body.listData);

    await ListedNfts.create(listedNftsArray);
    const createdListings = await ActivityDatas.create(activityDatasArray);

    res.send(createdListings);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Some error occurred while creating the ListedNfts.",
    });
  }
};

// Find a single ListedNfts with an id
exports.findOne = (req, res) => {
  const { mintAddr } = req.params;
  ListedNfts.findOne({ mintAddr })
    .then((data) => {
      if (!data)
        res
          .status(404)
          .send({ message: "Not found ListedNfts with walletAddr and seller" });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving ListedNfts with walletAddr and seller",
      });
    });
};

// Retrieve all listed datas from the database for a specific creator.
exports.findAllBySeller = async (req, res) => {
  try {
    const seller = req.params.id;
    const data = await ListedNfts.find({
      seller: seller,
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving ListedNfts.",
    });
  }
};

// Retrieve all listed datas from the database for a specific creator.
exports.findByCollectionAddr = async (req, res) => {
  try {
    const collectionAddr = req.params.id;
    const data = await ListedNfts.find({
      collectionAddr: collectionAddr,
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving ListedNfts.",
    });
  }
};

// Find all ListedNfts
exports.findAll = (req, res) => {
  ListedNfts.find({})
    .then((data) => {
      if (!data || data.length === 0)
        res.status(404).send({ message: "No ListedNfts found" });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ListedNfts.",
      });
    });
};

// Update the listed price with the specified mintAddr in the request
exports.update = async (req, res) => {
  const { transaction, updateData, mintAddr } = req.body;

  try {
    // Send and confirm transaction
    const txId = await sendTransaction(transaction);
    await solConnection.confirmTransaction(txId, "finalized");

    // Update ListedNfts document with new prices and timestamps
    const now = Date.now();
    const updatedListedNft = await ListedNfts.findOneAndUpdate(
      { mintAddr: mintAddr },
      {
        solPrice: updateData.solPrice,
        tokenPrice: updateData.tokenPrice,
        createdAt: now,
        ...(updateData.solPrice !== undefined && { lastSolPriceChangeAt: now }),
        ...(updateData.tokenPrice !== undefined && {
          lastTokenPriceChangeAt: now,
        }),
        updatedAt: now,
        ...(updateData.solPrice !== undefined && { lastSolPriceChangeAt: now }),
        ...(updateData.tokenPrice !== undefined && {
          lastTokenPriceChangeAt: now,
        }),
      }
    );

    if (!updatedListedNft) {
      return res.status(404).send({
        message: `Cannot update ListedNfts. Maybe ListedNfts was not found!`,
      });
    }

    // Create activity data array and save to database
    // const activityDatasArray = createActivityDataArray(updateData);
    const createdListings = await ActivityDatas.create({
      imgUrl: updateData.imgUrl,
      tokenId: updateData.tokenId,
      mintAddr: updateData.mintAddr,
      txType: updateData.txType,
      solPrice: updateData.solPrice,
      tokenPrice: updateData.tokenPrice,
      seller: updateData.seller,
      buyer: updateData.buyer,
    });

    res.send({
      message: "ListedNfts was updated successfully.",
      data: createdListings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Some error occurred while updating the price",
      error: error.message,
    });
  }
};

// Delete a ListedNfts with the specified mintAddr in the request
exports.delete = (req, res) => {
  const mintAddr = req.params.mintAddr;

  ListedNfts.findOneAndDelete({ mintAddr: mintAddr })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete ListedNfts with mintAddr=${mintAddr}. Maybe ListedNfts was not found!`,
        });
      } else {
        res.send({
          message: "ListedNfts was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete ListedNfts with mintAddr=" + mintAddr,
      });
    });
};

// Delete a ListedNfts with the specified mintAddr in the request
exports.deleteListedNfts = async (req, res) => {
  const { transactions: txs, delistData, mintAddrArray } = req.body;

  try {
    let signatures = await Promise.all(txs.map((tx) => sendTransaction(tx)));

    await Promise.all(
      signatures.map((signature) =>
        solConnection.confirmTransaction(signature, "confirmed")
      )
    );

    // Delete listed NFTs from database
    const deleteResult = await ListedNfts.deleteMany({
      mintAddr: { $in: mintAddrArray },
    });

    // Update all offers where `mintAddr` is same and `buyer` is different
    const offerUpdateData = await OfferDatas.updateMany(
      { mintAddr: { $in: mintAddrArray } },
      { $set: { active: 0 } }
    );

    if (!offerUpdateData) {
      return res.status(404).send({
        message: `Cannot update OfferDatas with mintAddr=${mintAddr}. Maybe ListedData was not found!`,
      });
    }

    if (deleteResult.deletedCount === 0) {
      return res.status(404).send({
        message: `Cannot delete ListedNfts with mintAddrs=${mintAddrArray}. Maybe they were not found.`,
      });
    }

    // Save activity data to database
    const activityDataArray = createActivityDataArray(delistData);
    await ActivityDatas.create(activityDataArray);

    // Return success response
    return res.status(200).send({
      message: `ListedNfts with mintAddrs=${mintAddrArray} were deleted successfully!`,
      count: deleteResult.deletedCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      message: `Could not delete ListedNfts with mintAddrs=${mintAddrArray}`,
    });
  }
};

// Delete a ListedNfts with the specified mintAddr in the request
exports.purchaseListedNfts = async (req, res) => {
  const { transaction: txs, purchaseData, mintAddrArray } = req.body;

  try {
    let signatures = await Promise.all(txs.map((tx) => sendTransaction(tx)));

    await Promise.all(
      signatures.map((signature) =>
        solConnection.confirmTransaction(signature, "confirmed")
      )
    );

    // Delete listed NFTs from database
    const deleteResult = await ListedNfts.deleteMany({
      mintAddr: { $in: mintAddrArray },
    });

    // Update all offers where `mintAddr` is same and `buyer` is different
    const offerUpdateData = await OfferDatas.updateMany(
      { mintAddr: { $in: mintAddrArray } },
      { $set: { active: 0 } }
    );

    if (!offerUpdateData) {
      return res.status(404).send({
        message: `Cannot update OfferDatas with mintAddr=${mintAddr}. Maybe ListedData was not found!`,
      });
    }

    if (deleteResult.deletedCount === 0) {
      return res.status(404).send({
        message: `Cannot delete ListedNfts with mintAddrs=${mintAddrArray}. Maybe they were not found.`,
      });
    }

    // Save activity data to database
    const activityDataArray = createActivityDataArray(purchaseData);
    await ActivityDatas.create(activityDataArray);

    // Return success response
    return res.status(200).send({
      message: `ListedNfts with mintAddrs=${mintAddrArray} were deleted successfully!`,
      count: deleteResult.deletedCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      message: `Could not delete ListedNfts with mintAddrs=${mintAddrArray}`,
    });
  }
};

// Delete all ListedNfts from the database.
exports.deleteAll = (req, res) => {
  ListedNfts.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} ListedNfts were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all ListedNfts.",
      });
    });
};
