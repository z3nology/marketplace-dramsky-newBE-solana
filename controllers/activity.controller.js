const db = require("../models");
const ActivityDatas = db.activityDatas;

function createActivityDataArray(listData) {
  return listData.map((data) => ({
    imgUrl: data.imgUrl,
    tokenId: data.tokenId,
    txType: data.txType,
    solPrice: data.solPrice,
    tokenPrice: data.tokenPrice,
    seller: data.seller,
    buyer: data.buyer,
  }));
}

// Create and Save a new activity data
exports.create = async (req, res) => {
  try {
    const activityDatasArray = createActivityDataArray(req.body.listData);
    const createdListings = await ActivityDatas.create(activityDatasArray);
    res.send(createdListings);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Some error occurred while creating the ListedNfts.",
    });
  }
};

// Retrieve all activity datas from the database for a specific creator.
exports.findAllBySellerOrBuyer = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await ActivityDatas.find({
      $or: [
        { txType: 0, seller: id },
        { txType: 1, seller: id },
        { txType: 2, buyer: id },
        { txType: 3, buyer: id },
        { txType: 4, $or: [{ seller: id }, { buyer: id }] },
      ],
    }).sort({ createdAt: "desc" });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving activityDatas.",
    });
  }
};
// Retrieve all activity datas from the database for a specific creator.
exports.findByMintAddr = async (req, res) => {
  try {
    const mintAddr = req.params.id;
    const data = await ActivityDatas.find({
      mintAddr: mintAddr,
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving activityDatas.",
    });
  }
};

// Delete all ActivityDatas from the database.
exports.deleteAll = (req, res) => {
  ActivityDatas.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} ActivityDatas were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all ActivityDatas.",
      });
    });
};
