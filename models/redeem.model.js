module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      imgUrl: String,
      collectionName: String,
      tokenId: Number,
      status: Boolean,
      transaction: String,
      mintAddr: String,
    },
    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const RedeemDatas = mongoose.model("redeemdatas", schema);
  return RedeemDatas;
};
