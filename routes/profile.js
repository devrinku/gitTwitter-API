const express = require("express");
const router = express.Router();
const idChecker = require("./../middlewares/idchecker");
const advancedQuery = require("./../middlewares/advancedQuery");

const Profile = require("./../models/Profile");
const {
  getProfiles,
  getMe,
  getProfile,
  createProfile,
  updateProfile,
  deleteNotifications,
  follow,
  getFollowers,
  getFollowings,
  useGithub,
  searchProfiles,
  deleteNotification,
  useGithubRepos,
} = require("./../controllers/profile");
const response = require("../middlewares/response");
const authenticate = require("./../middlewares/authenticate");
const checkOwnership = require("./../middlewares/checkOwnership");
const educationRoute = require("./education");
const experienceRoute = require("./experience");
const PostRoute = require("./post");
const User = require("./../models/User");

//Public Routes
router.use("/:id/education", educationRoute);
router.use("/:id/experience", experienceRoute);
router.use("/:id/post", PostRoute);
router.post("/search", searchProfiles, response);
router.get(
  "/",
  advancedQuery(Profile, {
    path: "user",
    select: "name image ",
  }),
  getProfiles,
  response
);

router.get("/:id", idChecker(Profile, "profile"), getProfile, response);
router.use(authenticate);
//Private Routes
router.post("/", createProfile, response);
router.get("/user/me", getMe, response);

router
  .route("/:id/notifications")
  .put(
    idChecker(Profile, "profile"),
    checkOwnership(Profile, "profile", "clear notifications of "),
    deleteNotification,
    response
  );

router
  .route("/:id")
  .put(
    idChecker(Profile, "profile"),
    checkOwnership(Profile, "profile", "update"),
    updateProfile,
    response
  );

router.delete(
  "/notifications/:id",
  idChecker(Profile, "profile"),
  checkOwnership(Profile, "profile", "update"),
  deleteNotifications,
  response
);

router
  .route("/:id/follow")
  .put(idChecker(Profile, "profile"), follow, response);
router
  .route("/:id/followers")
  .get(idChecker(Profile, "profile"), getFollowers, response);
router
  .route("/:id/followings")
  .get(idChecker(Profile, "profile"), getFollowings, response);

router.route("/github/:name/repos").get(useGithubRepos, response);
router.route("/github/:name").get(useGithub, response);
module.exports = router;
