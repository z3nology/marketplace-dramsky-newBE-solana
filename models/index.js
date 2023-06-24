const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.listedNfts = require("./listednfts.model.js")(mongoose);
db.userProfileDatas = require("./userprofile.model.js")(mongoose);
db.activityDatas = require("./activity.model.js")(mongoose);
db.offerDatas = require("./offer.model.js")(mongoose);
db.redeemDatas = require("./redeem.model.js")(mongoose);

module.exports = db;
