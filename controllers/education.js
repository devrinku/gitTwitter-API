const asyncHandler = require("./../middlewares/asyncHandler");
const ErrorResponse = require("./../utils/errorClass");
const Response = require("./../utils/reponseClass");
const Education = require("../models/Education");

exports.getEducations = asyncHandler(async (req, res, next) => {
  const educations = await Education.find({ profile: req.params.id });
  res.response = new Response(200, educations);
  next();
});

exports.addEducation = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.profile = req.params.id;
  const education = await Education.create(req.body);
  res.response = new Response(201, education);
  next();
});

exports.updateEducation = asyncHandler(async (req, res, next) => {
  for (let prop in req.body) {
    if (prop === "_id" || prop === "user") {
      delete req.body[prop];
    }
  }
  const education = await Education.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  res.response = new Response(200, education);
  next();
});

exports.deleteEducation = asyncHandler(async (req, res, next) => {
  await res.result.remove();
  res.response = new Response(200, {});
  next();
});
