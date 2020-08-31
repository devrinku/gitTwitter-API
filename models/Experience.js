const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, "Please enter your job title"],
  },
  company: {
    type: String,
    required: [true, "Please enter the company name"],
  },
  location: {
    type: String,
  },
  from: {
    type: Date,
    required: [true, "Please enter a date of joining"],
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

module.exports = mongoose.model("Experience", ExperienceSchema);
