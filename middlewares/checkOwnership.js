const ErrorResponse = require("../utils/errorClass");
const asyncHandler = require("./asyncHandler");

const checkOwnership = (model, modelname, task) =>
  asyncHandler(async (req, res, next) => {
    const resource = await model.findById(req.params.id);

    if (resource.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `You are not authorized to ${task} this ${modelname}`,
          401
        )
      );
    } else {
      next();
    }
  });

module.exports = checkOwnership;
