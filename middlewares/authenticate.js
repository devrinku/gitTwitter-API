const asyncHandler = require("./../middlewares/asyncHandler");
const ErrorResponse = require("./../utils/errorClass");
const User = require("./../models/User");
const jwt = require("jsonwebtoken");

const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorResponse("Unauthorized Route", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    return next(new ErrorResponse("Unauthorized Route", 401));
  }
});

module.exports = authenticate;
