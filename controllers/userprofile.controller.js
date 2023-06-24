const db = require("../models");
const UserProfileDatas = db.userProfileDatas;
const fs = require("fs");

exports.create = async (req, res) => {
  const { walletAddr, username, bio } = req.body;
  try {
    let avatarImg = "";
    if (req.files?.avatar) {
      const image = req.files.avatar;

      // validate and configure upload path
      if (!fs.existsSync(`${__dirname}/../public/assets/imgs/userAvatars/`)) {
        fs.mkdirSync(`${__dirname}/../public/assets/imgs/userAvatars/`, {
          recursive: true,
        });
      }

      // move uploaded file to destination directory
      await image.mv(
        `${__dirname}/../public/assets/imgs/userAvatars/${walletAddr}_avatar.png`
      );
      avatarImg = req.body.walletAddr + "_avatar.png";
    }

    let bannerImg = "";
    if (req.files?.banner) {
      const image = req.files.banner;

      // validate and configure upload path
      if (!fs.existsSync(`${__dirname}/../public/assets/imgs/userBanners/`)) {
        fs.mkdirSync(`${__dirname}/../public/assets/imgs/userBanners/`, {
          recursive: true,
        });
      }

      // move uploaded file to destination directory
      await image.mv(
        `${__dirname}/../public/assets/imgs/userBanners/${walletAddr}_banner.png`
      );
      bannerImg = req.body.walletAddr + "_banner.png";
    }

    // Check if entry with provided walletAddr exists
    let userProfileData = await UserProfileDatas.findOne({ walletAddr });

    if (userProfileData) {
      // Update avatarImg field if applicable
      if (bannerImg) {
        userProfileData.bannerImg = bannerImg;
      }
      // Update avatarImg field if applicable
      if (avatarImg) {
        userProfileData.avatarImg = avatarImg;
      }
      userProfileData.name = username; // Update username field
      userProfileData.bio = bio; // Update bio field
    } else {
      // Create new entry with provided data
      userProfileData = new UserProfileDatas({
        avatarImg: avatarImg,
        bannerImg: bannerImg,
        walletAddr: walletAddr,
        name: username, // Add username field
        bio: bio, // Add bio field
      });
    }
    // Save or update UserProfileDatas in the database
    await userProfileData.save();

    res.send("success"); // Send success message
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message:
        err.message ||
        "Some error occurred while creating or updating the UserProfileDatas.",
    });
  }
};

// Find a single UserProfileDatas with an id
exports.findOne = (req, res) => {
  const walletAddr = req.params.id;

  UserProfileDatas.findOne({ walletAddr })
    .then((data) => {
      if (!data)
        res.status(404).send({
          message:
            "Not found UserProfileDatas with wallet address " + walletAddr,
        });
      else {
        // Update the imgurl if wallet address already exists
        return UserProfileDatas.exists({ walletAddr }).then((exists) => {
          if (exists) {
            const updatedData = { ...data._doc };
            updatedData.avatarImg = `${walletAddr}_avatar.png`;
            return UserProfileDatas.findOneAndUpdate(
              { walletAddr },
              updatedData,
              { new: true }
            ).then((updatedRecord) => res.send(updatedRecord));
          }
          // If wallet address does not exist, return the record as is
          else return res.send(data);
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          "Error retrieving UserProfileDatas with wallet address=" + walletAddr,
      });
    });
};

// Delete a UserProfileDatas with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  UserProfileDatas.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete UserProfileDatas with id=${id}. Maybe UserProfileDatas was not found!`,
        });
      } else {
        res.send({
          message: "UserProfileDatas was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete UserProfileDatas with id=" + id,
      });
    });
};

// Delete all UserProfileDatass from the database.
exports.deleteAll = (req, res) => {
  UserProfileDatas.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} UserProfileDatass were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all UserProfileDatass.",
      });
    });
};
