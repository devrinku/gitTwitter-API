const routeMap = (req, res, next) => {
  console.log(`${req.method} :     ${req.originalUrl}   `.cyan);
  next();
};

module.exports = routeMap;
