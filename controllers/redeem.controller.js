const db = require("../models");
const RedeemDatas = db.redeemDatas;

// Create and Save a new RedeemDatas
exports.create = async (req, res) => {
  const redeemDatas = req.body.redeemDatas;
  const redeemDatasArray = [];

  if (!redeemDatas || !Array.isArray(redeemDatas)) {
    return res.status(400).send({
      message: "RedeemDatas array is missing or invalid",
    });
  }

  for (let i = 0; i < redeemDatas.length; i++) {
    const data = new RedeemDatas({
      imgUrl: redeemDatas[i].imgUrl,
      collectionName: redeemDatas[i].collectionName,
      tokenId: redeemDatas[i].tokenId,
      status: redeemDatas[i].status,
      transaction: redeemDatas[i].transaction,
      mintAddr: redeemDatas[i].mintAddr,
    });
    redeemDatasArray.push(data);
  }

  RedeemDatas.create(redeemDatasArray)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the RedeemDatas.",
      });
    });
};

// Delete all RedeemDatas from the database.
exports.deleteAll = (req, res) => {
  RedeemDatas.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} RedeemDatas were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all RedeemDatas.",
      });
    });
};
