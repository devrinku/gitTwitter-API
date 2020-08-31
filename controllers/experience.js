const asyncHandler = require("./../middlewares/asyncHandler");
const ErrorResponse = require("./../utils/errorClass");
const Response = require("./../utils/reponseClass");
const Experience = require("../models/Experience");

exports.getExperiences = asyncHandler(async (req, res, next) => {
  const experiences = await Experience.find({ profile: req.params.id });
  res.response = new Response(200, experiences);
  next();
});

exports.addExperience = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.profile = req.params.id;
  const experience = await Experience.create(req.body);
  res.response = new Response(201, experience);
  next();
});

exports.updateExperience = asyncHandler(async (req, res, next) => {
  for (let prop in req.body) {
    if (prop === "_id" || prop === "user") {
      delete req.body[prop];
    }
  }
  const experience = await Experience.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );
  res.response = new Response(200, experience);
  next();
});

exports.deleteExperience = asyncHandler(async (req, res, next) => {
  await res.result.remove();
  res.response = new Response(200, {});
  next();
});
