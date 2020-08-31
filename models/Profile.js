const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    website: {
      type: String,
    },

    status: {
      type: String,
      required: [true, "Please add your status"],
    },
    skills: {
      type: String,
      required: [true, "Please add your skills"],
    },
    bio: {
      type: String,
    },
    githubusername: {
      type: String,
      required: [true, "Please enter your github username"],
    },
    github: {
      type: String,
    },
    twitter: {
      type: String,
    },
    facebook: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    instagram: {
      type: String,
    },

    hometown: {
      type: String,
      required: [true, "Please enter your hometown"],
    },
    currentCity: {
      type: String,
    },

    notifications: {
      type: [],
      select: false,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProfileSchema.virtual("post", {
  ref: "Post",
  localField: "_id",
  foreignField: "profile",
  justOne: false,
});

ProfileSchema.virtual("education", {
  ref: "Education",
  localField: "_id",
  foreignField: "profile",
  justOne: false,
});
ProfileSchema.virtual("experience", {
  ref: "Experience",
  localField: "_id",
  foreignField: "profile",
  justOne: false,
});

ProfileSchema.methods.setFollowing = function (id) {
  if (!this.followings.includes(id.toString())) {
    this.followings.push(id.toString());
  }
};

ProfileSchema.methods.setFollower = function (id) {
  if (!this.followers.includes(id.toString())) {
    this.followers.push(id.toString());
  }
};

module.exports = mongoose.model("Profile", ProfileSchema);
