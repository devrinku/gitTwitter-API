const asyncHandler = require("./../middlewares/asyncHandler");
const ErrorResponse = require("./../utils/errorClass");

const feildChecker = (model, feild, modelName) =>
  asyncHandler(async (req, res, next) => {
    if (req.body[feild]) {
      req.body[feild] = req.body[feild].trim();
    }
    const resource = await model.findOne({ [feild]: req.body[feild] });
    if (resource) {
      return next(
        new ErrorResponse(
          `${
            feild.charAt(0).toUpperCase() + feild.slice(1)
          } is already associated with another ${modelName}`,
          400
        )
      );
    }
    next();
  });

module.exports = feildChecker;
