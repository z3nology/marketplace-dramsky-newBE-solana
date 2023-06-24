module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      imgUrl: String,
      tokenId: String,
      listedNftId: String,
      offerPrice: Number,
      collectionAddr: String,
      byToken: Boolean,
      royaltiy: Number,
      expiresAt: Number,
      mintAddr: String,
      active: Number,
      seller: String,
      buyer: String,
    },
    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const OfferDatas = mongoose.model("offerdatas", schema);
  return OfferDatas;
};
