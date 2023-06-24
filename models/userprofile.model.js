module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      name: String,
      avatarImg: String,
      bannerImg: String,
      bio: String,
      walletAddr: String,
      telegram_id: String,
      email: String,
    },
    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const UserProfileDatas = mongoose.model("userprofiledata", schema);
  return UserProfileDatas;
};
