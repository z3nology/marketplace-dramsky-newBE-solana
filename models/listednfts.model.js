module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      tokenId: String,
      collectionAddr: String,
      imgUrl: String,
      mintAddr: String,
      seller: String,
      metaDataUrl: String,
      solPrice: Number,
      tokenPrice: Number,
    },
    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const ListedNfts = mongoose.model("listednfts", schema);
  return ListedNfts;
};
