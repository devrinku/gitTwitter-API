const mongoose = require("mongoose");

const EducationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  school: {
    type: String,
    required: [true, "Please  enter the name of school"],
  },
  degree: {
    type: String,
    required: [true, "Please enter the type of degree"],
  },
  fieldofstudy: {
    type: String,
  },
  from: {
    type: Date,
    required: [true, "Please enter the date of joining the course "],
  },
  to: {
    type: Date,
  },
  current: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Education", EducationSchema);
