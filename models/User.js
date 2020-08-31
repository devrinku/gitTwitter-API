const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Please enter your email"],
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [8, "Password must be atleast of 8 characters"],
      select: false,
    },
    resetTokenPassword: String,
    resetTokenExpire: Date,
    image: {
      type: String,
      default: "no-image.png",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.genToken = function () {
  return jwt.sign({ id: this._id }, process.env.SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.resetPasswordToken = function () {
  const genSalt = crypto.randomBytes(20).toString("hex");
  this.resetTokenPassword = crypto
    .createHash("sha256")
    .update(genSalt)
    .digest("hex");

  this.resetTokenExpire = Date.now() + 10 * 60 * 1000;
  return genSalt;
};

UserSchema.pre("remove", async function () {
  await this.model("Profile").deleteOne({ user: this.id });
  console.log(`Profile also deleted for user ${this.id}`);
  await this.model("Education").deleteMany({ user: this.id });
  console.log(`Education Credentials also deleted for user ${this.id}`);
  await this.model("Experience").deleteMany({ user: this.id });
  console.log(`Experience Credentials also deleted for user ${this.id}`);
  await this.model("Post").deleteMany({
    user: this.id,
  });

  console.log(`Posts also deleted for user ${this.id}`);
});

UserSchema.virtual("profile", {
  ref: "Profile",
  localField: "_id",
  foreignField: "user",
  justOne: false,
});

module.exports = mongoose.model("User", UserSchema);
