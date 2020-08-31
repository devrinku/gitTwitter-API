const express = require("express");
const router = express.Router({ mergeParams: true });
const idChecker = require("./../middlewares/idchecker");

const Profile = require("./../models/Profile");
const Experience = require("./../models/Experience");
const {
  getExperiences,
  addExperience,
  updateExperience,
  deleteExperience,
} = require("./../controllers/experience");
const response = require("../middlewares/response");
const authenticate = require("./../middlewares/authenticate");
const checkOwnership = require("./../middlewares/checkOwnership");
const User = require("./../models/User");

//Public Routes
router.route("/").get(idChecker(Profile, "profile"), getExperiences, response);
router.use(authenticate);
//Private Routes
router
  .route("/")
  .post(
    idChecker(Profile, "profile"),
    checkOwnership(Profile, "profile", "update"),
    addExperience,
    response
  );
router
  .route("/:id")
  .put(
    idChecker(Experience, "Experience Credentials"),
    checkOwnership(Experience, "Experience Credential ", "update"),
    updateExperience,
    response
  )
  .delete(
    idChecker(Experience, "Experience Credentials"),
    checkOwnership(Experience, "Experience Credential ", "delete"),
    deleteExperience,
    response
  );

module.exports = router;
