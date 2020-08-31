const asyncHandler = require("./asyncHandler");

const advancedQuery = (model, populate) =>
  asyncHandler(async (req, res, next) => {
    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    queryStr = JSON.parse(queryStr);
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete queryStr[param]);
    let query = model.find(queryStr).populate(populate);

    if (req.query.select) {
      const feilds = req.query.select.split(",").join(" ");
      query = query.select(feilds);
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const lastIndex = page * limit;
    query = query.skip(startIndex).limit(limit);
    const results = await query;

    const totalDocs = await model.countDocuments();

    const pagination = {};
    if (lastIndex < totalDocs) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.previous = {
        page: page - 1,
        limit,
      };
    }
    res.pagination = pagination;
    res.results = results;

    next();
  });

module.exports = advancedQuery;
