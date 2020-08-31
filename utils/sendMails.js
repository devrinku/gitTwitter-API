const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  const message = {
    from: `Gitbook <${process.env.EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.text,
  };
  const info = await transporter.sendMail(message);
  console.log(`Message sent to : ${info.messageId} `);
};

module.exports = sendMail;
