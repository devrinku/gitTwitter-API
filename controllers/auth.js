const asyncHandler = require("./../middlewares/asyncHandler");
const ErrorResponse = require("./../utils/errorClass");
const Response = require("./../utils/reponseClass");
const sendMail = require("./../utils/sendMails");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Posts = require("../models/Post");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });
  getToken(user, res, next, 201);
});

exports.getNotifiedUser = asyncHandler(async (req, res, next) => {
  let users = await User.find();
  let { data } = req.body;

  users = data.map(async (elem) => {
    let user = await User.findById(elem.user.toString()).select("name image");

    user = {
      user,
      type: elem.type,
      resourceId: elem.resourceId,
      notificationId: elem.notificationId,
    };

    return user;
  });
  users = await Promise.all(users);

  res.response = new Response(200, users);
  next();
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorResponse("Please enter a  email and a password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 401));
  }
  getToken(user, res, next, 200);
});

exports.getMe = (req, res, next) => {
  res.response = new Response(200, req.user);
  next();
};

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;
  const feilds = {};
  if (name) feilds.name = name;
  if (email) feilds.email = email;
  const user = await User.findByIdAndUpdate(req.user.id, feilds, {
    runValidators: true,
    new: true,
  });
  res.response = new Response(200, user);
  next();
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { newPassword, oldPassword } = req.body;

  if (!newPassword || !oldPassword) {
    return next(
      new ErrorResponse("Please enter your old  password and new password", 401)
    );
  }

  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.matchPassword(oldPassword))) {
    return next(new ErrorResponse("Incorrect password", 401));
  }
  user.password = newPassword;
  await user.save();
  getToken(user, res, next, 200);
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse("Please enter your  email", 400));
  }
  const regx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!email.match(regx)) {
    return next(new ErrorResponse("Enter a valid  email", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid Credentials", 400));
  }
  const resetToken = user.resetPasswordToken();

  await user.save();

  const link = `${req.protocol}://${req.get(
    "host"
  )}/resetpassword/${resetToken}`;

  const message = `Click on the link to reset your password : ${link}`;
  try {
    await sendMail({
      email: user.email,
      subject: "Password reset link",
      text: message,
    });
    res.response = new Response(
      200,
      "A link is sent on your registered email,follow the link  to reset your password"
    );
    setTimeout(async () => {
      user.resetTokenPassword = undefined;
      user.resetTokenExpire = undefined;
      await user.save();
    }, process.env.EXPIRE_SALT);
    next();
  } catch (error) {
    user.resetTokenPassword = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    console.log(error);
    return next(new ErrorResponse("Failed to reset password", 500));
  }
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { newpassword } = req.body;
  if (!newpassword) {
    return next(new ErrorResponse("Enter your new Passsword", 400));
  }
  const salt = crypto
    .createHash("sha256")
    .update(req.params.salt)
    .digest("hex");

  const user = await User.findOne({
    resetTokenPassword: salt,
    resetTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Broken Link try again", 401));
  }

  user.password = newpassword;
  user.resetTokenPassword = undefined;
  user.resetTokenExpire = undefined;
  await user.save();
  getToken(user, res, next, 200);
});

exports.uploadDi = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse("Please select a file first", 400));
  }
  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please select a image file", 400));
  }
  if (file.size > process.env.FILE_SIZE) {
    return next(new ErrorResponse("File size must be less then 1mb", 400));
  }
  const user = await User.findById(req.user.id).select("image");
  const img = `${process.env.FILE_PATH}/${user.image}`;
  fs.stat(img, (err, stat) => {
    if (err === null) {
      if (img !== "./client/src/public/uploads/no-image.png") {
        fs.unlink(`${process.env.FILE_PATH}/${user.image}`, async (err) => {
          if (err) {
            console.log(err);
          } else {
            user.image = undefined;
            await user.save();
          }
        });
      }
    }
    file.name = `photo_${req.user.name}_${req.user.id}${file.name}`;

    file.mv(`${process.env.FILE_PATH}/${file.name}`, async (err) => {
      if (err) {
        console.log(err);
        return next(new ErrorResponse("Image not uploaded", 500));
      }
      await User.findByIdAndUpdate(
        req.user.id,
        {
          image: file.name,
        },
        {
          runValidators: true,
          new: true,
        }
      );
    });
    res.response = new Response(200, file.name);
    next();
  });
});
///
exports.deleteDi = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("image");
  fs.unlink(`${process.env.FILE_PATH}/${user.image}`, async (err) => {
    if (err) {
      if (err.errno === -4058) {
        return next(new ErrorResponse("Image not found", 404));
      }
      console.log(err);
      return next(new ErrorResponse("File not deleted", 500));
    } else {
      user.image = undefined;
      await user.save();
      res.response = new Response(200, {});
      next();
    }
  });
});

exports.deleteAccount = asyncHandler(async (req, res, next) => {
  await req.user.remove();

  const profiles = await Profile.find().select("+notifications");

  profiles.forEach(async (profile) => {
    profile.notifications = profile.notifications.filter((notification) => {
      return notification.user.toString() !== req.user.id.toString();
    });
    profile.followers = profile.followers.filter((follower) => {
      return follower.toString() !== req.params.id.toString();
    });
    profile.followings = profile.followings.filter((following) => {
      return following.toString() !== req.params.id.toString();
    });
    await profile.save();
  });
  const posts = await Posts.find();
  posts.forEach(async (post) => {
    post.likes = post.likes.filter((like) => {
      return like.user.toString() !== req.user.id.toString();
    });
    post.comments = post.comments.filter((comment) => {
      return comment.user.toString() !== req.user.id.toString();
    });
    await post.save();
  });

  res.response = new Response(200, {});
  next();
});

const getToken = (user, res, next, code) => {
  const token = user.genToken();
  res.response = new Response(code, { token });
  next();
};
