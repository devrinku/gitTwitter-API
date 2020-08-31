const express = require("express");
const colors = require("colors");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const routeMap = require("./middlewares/routeMap");
const errorHandler = require("./middlewares/errorHandler");
const auth = require("./routes/auth");
const profile = require("./routes/profile");
const education = require("./routes/education");
const experience = require("./routes/experience");
const post = require("./routes/post");
const fileupload = require("express-fileupload");
const path = require("path");
const xss = require("xss-clean");
const helmet = require("helmet");

const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");

//Initialize Config
dotenv.config({ path: "./config/config.env" });

//Connect with database
connectDB();

//Middlewares
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

app.use(hpp());

//Using bodyParser
app.use(express.json());

//Using FileUploader
app.use(fileupload());

//Making Public folder static
app.use(express.static(path.join(__dirname, "public")));

//Using routeMap
if (process.env.NODE_ENV === "development") {
  app.use(routeMap);
}

//Mounting Routes
app.use("/api/v1/auth", auth);
app.use("/api/v1/profile", profile);
app.use("/api/v1/education", education);
app.use("/api/v1/experience", experience);
app.use("/api/v1/post", post);

//Using custom ErrorHandler
app.use(errorHandler);

//Starting Server
const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port  ${PORT}`.yellow
      .bold
  )
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Unhandled Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
