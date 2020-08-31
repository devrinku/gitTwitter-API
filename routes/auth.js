const feildChecker = require("./../middlewares/feildChecker");
const authenticate = require("./../middlewares/authenticate");
const response = require("./../middlewares/response");
const idChecker = require("./../middlewares/idchecker");
const checkOwnership = require("./../middlewares/checkOwnership");
const Profile = require("./../models/Profile");
const User = require("./../models/User");
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  uploadDi,
  updateDetails,
  changePassword,
  getNotifiedUser,
  forgotPassword,
  resetPassword,
  deleteAccount,
  deleteDi,
} = require("./../controllers/auth");

//Public routes
router.post(
  "/register",
  feildChecker(User, "email", "user"),
  register,
  response
);
router.post("/login", login, response);
router.put("/forgotpassword", forgotPassword, response);
router.put("/resetpassword/:salt", resetPassword, response);
//Private Routes
router.use(authenticate);
router.post("/changepassword", changePassword, response);
router.post("/notifications", getNotifiedUser, response);
router.put("/uploadprofileimage", uploadDi, response);
router.delete("/deleteprofileimage", deleteDi, response);
router
  .route("/")
  .get(getMe, response)
  .put(feildChecker(User, "email", "user"), updateDetails, response);
router
  .route("/deleteaccount/:id")
  .delete(
    idChecker(Profile, "profile"),
    checkOwnership(Profile, "profile", "delete this account"),
    deleteAccount,
    response
  );
module.exports = router;
