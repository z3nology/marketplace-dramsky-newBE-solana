module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      imgUrl: String,
      tokenId: String,
      mintAddr: String,
      txType: Number,
      solPrice: Number,
      tokenPrice: Number,
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

  const ActivityDatas = mongoose.model("activitydatas", schema);
  return ActivityDatas;
};
