const ErrorResponse = require("./../utils/errorClass");

const errorHanlder = (err, req, res, next) => {
  let error = err;

  console.log(`${err.name.red} :  ${err.message}`);
  if (err.name === "CastError") {
    let message = err.message.split(" ").pop();
    message = `${message} not found with id ${err.value}`;
    message = message.replace(/"/g, "");
    error = new ErrorResponse(message, 400);
  }
  if (err.name === "ValidationError") {
    let message = Object.values(err.errors).map((err) => err.message);

    const enumMessage = message.filter((mesg) => mesg.includes("enum"));
    if (enumMessage.length) {
      message = message.filter((mesg) => !mesg.includes("enum"));
      const arr = enumMessage.map((mesg) => mesg.match(/`(.*?)`/g));
      const newarr = arr.map((elem) =>
        elem.map((word) => word.replace(/[.$`0-9]/g, ""))
      );
      const newmessage = newarr.map(
        (word) => `${word[0]} is not a valid value for ${word[1]}`
      );
      message.push(newmessage);
    }
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHanlder;
