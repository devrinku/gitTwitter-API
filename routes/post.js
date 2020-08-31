const express = require("express");
const router = express.Router({ mergeParams: true });
const idChecker = require("./../middlewares/idchecker");
const advancedQuery = require("./../middlewares/advancedQuery");

const Profile = require("./../models/Profile");
const {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
  likeDislikePost,
  likeCredentials,
  addcomment,
  getProfileAllPosts,
  deleteComment,
} = require("./../controllers/post");
const response = require("../middlewares/response");
const authenticate = require("./../middlewares/authenticate");
const checkOwnership = require("./../middlewares/checkOwnership");
const Post = require("../models/Post");

//Public Routes
router.get(
  "/",
  advancedQuery(Post, {
    path: "user",
    select: "name image",
  }),
  getAllPosts,
  response
);
router.get("/:id", idChecker(Post, "post"), getPost, response);
router.get(
  "/profile/:id",
  idChecker(Profile, "profile"),
  getProfileAllPosts,
  response
);
router
  .route("/:id/likes")
  .get(idChecker(Post, "post"), likeCredentials, response);

//Private Routes
router.use(authenticate);

router
  .route("/")
  .post(
    idChecker(Profile, "profile"),
    checkOwnership(Profile, "profile", "add a post to"),
    createPost,
    response
  );
router
  .route("/:id")
  .put(
    idChecker(Post, "post"),
    checkOwnership(Post, "post", "update"),
    updatePost,
    response
  )
  .delete(
    idChecker(Post, "post"),
    checkOwnership(Post, "post", "delete"),
    deletePost,
    response
  );
router
  .route("/:id/likes")
  .put(idChecker(Post, "post"), likeDislikePost, response);

router
  .route("/:id/comments")
  .post(idChecker(Post, "post"), addcomment, response);

router
  .route("/:id/comments/:commentId")
  .delete(idChecker(Post, "post"), deleteComment, response);

module.exports = router;
