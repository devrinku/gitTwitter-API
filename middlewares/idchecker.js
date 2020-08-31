const asyncHandler = require("./../middlewares/asyncHandler");
const ErrorResponse = require("./../utils/errorClass");

const idchecker = (model, modelname) =>
  asyncHandler(async (req, res, next) => {
    if (req.params.id) {
      const resource = await model.findById(req.params.id);

      if (!resource) {
        return next(
          new ErrorResponse(
            `${
              modelname.charAt(0).toUpperCase() + modelname.slice(1)
            } not found with id ${req.params.id}`,
            400
          )
        );
      } else {
        res.result = resource;
        return next();
      }
    }

    next();
  });

module.exports = idchecker;
