const express = require("express");
const router = express.Router({ mergeParams: true });
const idChecker = require("./../middlewares/idchecker");

const Profile = require("./../models/Profile");
const Education = require("./../models/Education");
const {
  getEducations,
  addEducation,
  updateEducation,
  deleteEducation,
} = require("./../controllers/education");
const response = require("../middlewares/response");
const authenticate = require("./../middlewares/authenticate");
const checkOwnership = require("./../middlewares/checkOwnership");
const User = require("./../models/User");

//Public Routes
router.route("/").get(idChecker(Profile, "profile"), getEducations, response);
router.use(authenticate);
//Private Routes
router
  .route("/")
  .post(
    idChecker(Profile, "profile"),
    checkOwnership(Profile, "profile", "update"),
    addEducation,
    response
  );
router
  .route("/:id")
  .put(
    idChecker(Education, "Education Credentials"),
    checkOwnership(Education, "Education Credential ", "update"),
    updateEducation,
    response
  )
  .delete(
    idChecker(Education, "Education Credentials"),
    checkOwnership(Education, "Education Credential ", "delete"),
    deleteEducation,
    response
  );

module.exports = router;
