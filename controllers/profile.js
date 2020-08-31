const asyncHandler = require("./../middlewares/asyncHandler");
const ErrorResponse = require("./../utils/errorClass");
const Response = require("./../utils/reponseClass");
const Profile = require("../models/Profile");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");

const axios = require("axios");

exports.getProfiles = asyncHandler(async (req, res, next) => {
  res.response = new Response(200, res.results, res.pagination);
  next();
});

exports.searchProfiles = asyncHandler(async (req, res, next) => {
  const { name, id } = req.body;
  const regx = new RegExp(`${name}`, "gi");
  if (!name) {
    return next(
      new ErrorResponse("Please enter a name to search a profile", 404)
    );
  }
  let profiles = await Profile.find().populate("user", ["name", "image"]);
  profiles = profiles.filter(
    (profile) => profile._id.toString() !== id.toString()
  );

  profiles = profiles.filter((profile) =>
    profile.user.name.split(" ")[0].match(regx)
  );
  res.response = new Response(200, profiles);
  next();
});
exports.getMe = asyncHandler(async (req, res, next) => {
  let profile = await Profile.findOne({ user: req.user.id })
    .select("+notifications")
    .populate({
      path: "education",
    })
    .populate({
      path: "experience",
    })
    .populate({
      path: "post",
    });

  if (!profile) {
    return next(
      new ErrorResponse("No profile found ,make sure to create one first", 404)
    );
  }
  res.response = new Response(200, profile);
  next();
});

exports.getProfile = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id)
    .populate({
      path: "post",
      populate: {
        path: "user",
        select: "name image",
      },
    })
    .populate({
      path: "user",
      select: "name image",
    })
    .populate({
      path: "education",
    })
    .populate({
      path: "experience",
    });
  res.response = new Response(200, profile);
  next();
});

exports.createProfile = asyncHandler(async (req, res, next) => {
  let profile = await Profile.findOne({ user: req.user.id });
  if (profile) {
    return next(new ErrorResponse("You have already created a profile", 400));
  }
  req.body.user = req.user.id;
  if (req.body.skills) {
    req.body.skills = req.body.skills
      .split(",")
      .map((skill) => skill.trim())
      .map((skill) => skill.charAt(0).toUpperCase() + skill.slice(1))
      .join(",");
  }
  for (let prop in req.body) {
    if (
      prop === "notifications" ||
      prop === "followers" ||
      prop === "followings"
    ) {
      delete req.body[prop];
    }
    if (req.body[prop] === "") {
      delete req.body[prop];
    }
  }
  profile = await Profile.create(req.body);
  profile = await Profile.findById(profile.id)
    .populate("user", ["name", "image"])
    .select("+notifications");
  res.response = new Response(201, profile);
  next();
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  if (req.body.skills) {
    req.body.skills = req.body.skills
      .split(",")
      .map((skill) => skill.trim())
      .map((skill) => skill.charAt(0).toUpperCase() + skill.slice(1))
      .join(",");
  }
  let profile;
  for (let prop in req.body) {
    if (
      prop === "notifications" ||
      prop === "followers" ||
      prop === "followings"
    ) {
      delete req.body[prop];
    }
    if (req.body[prop] === "") {
      delete req.body[prop];
      res.result[prop] = undefined;
      await res.result.save();
    }
  }
  profile = await Profile.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  }).select("+notifications");
  res.response = new Response(200, profile);
  next();
});

exports.deleteNotifications = asyncHandler(async (req, res, next) => {
  const profile = await Profile.findById(req.params.id).select(
    "+notifications"
  );

  profile.notifications = [];
  await profile.save();
  res.response = new Response(200, {});
  next();
});

//
exports.follow = asyncHandler(async (req, res, next) => {
  const reqUser = await Profile.findOne({ user: req.user.id });
  if (!reqUser) {
    return next(
      new ErrorResponse("No profile found ,make sure to create one first", 404)
    );
  }
  const resUser = await Profile.findById(req.params.id)
    .select("+notifications")
    .populate("user", ["name"]);
  if (req.params.id.toString() === reqUser.id.toString()) {
    return next(new ErrorResponse("You cant follow yourself", 401));
  }
  reqUser.setFollowing(req.params.id);
  await reqUser.save();
  resUser.setFollower(reqUser.id);

  const mesg = {
    user: req.user.id,
    type: "following",
    resourceId: reqUser._id,
    notificationId: uuidv4(),
  };

  let removeIndex = null;
  resUser.notifications.forEach((notification) => {
    if (
      notification.user.toString() === mesg.user.toString() &&
      notification.type === mesg.type &&
      notification.resourceId.toString() === mesg.resourceId.toString()
    ) {
      removeIndex = resUser.notifications.indexOf(notification);
    }
  });

  if (removeIndex !== -1 && removeIndex !== null) {
    resUser.notifications.splice(removeIndex, 1);
  }

  resUser.notifications.push(mesg);
  await resUser.save();

  res.response = new Response(
    200,
    `${
      req.user.name.charAt(0).toUpperCase() + req.user.name.slice(1)
    } started following  ${resUser.user.name}`
  );
  next();
});

exports.getFollowers = asyncHandler(async (req, res, next) => {
  settingList("followers", res, next);
});

exports.getFollowings = asyncHandler(async (req, res, next) => {
  settingList("followings", res, next);
});

exports.useGithubRepos = asyncHandler(async (req, res, next) => {
  gitHub(
    `https://api.github.com/users/${req.params.name}/repos?per_page=10&sort=created:asc`,
    res,
    next
  );
});

exports.useGithub = asyncHandler(async (req, res, next) => {
  gitHub(`https://api.github.com/users/${req.params.name}`, res, next);
});

//Static Function

const settingList = async (resource, res, next) => {
  let persons = res.result[resource];
  persons = persons.map(async (person) => {
    return await Profile.findById(person).select("-notifications").populate({
      path: "user",
      select: "name image",
    });
  });

  const profiles = await Promise.all(persons);
  res.response = new Response(200, profiles);
  next();
};

const gitHub = async (url, res, next) => {
  try {
    const uri = encodeURI(url);
    const headers = {
      "user-agent": "node.js",
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    };

    const gitHubResponse = await axios.get(uri, { headers });

    res.response = new Response(200, gitHubResponse.data);
    next();
  } catch (error) {
    if (
      (error.response.status === 404, error.response.statusText === "Not Found")
    )
      return next(new ErrorResponse(`User not found`, 404));
  }
};
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const { notificationId } = req.body;

  if (!notificationId) {
    return next(
      new ErrorResponse(
        "Send a unique notification id to remove notification",
        404
      )
    );
  }
  const profile = await Profile.findById(req.params.id)
    .select("+notifications")
    .populate({
      path: "education",
    })
    .populate({
      path: "experience",
    });

  let notifications = profile.notifications;

  notifications = notifications.filter(
    (elem) => elem.notificationId.toString() !== notificationId.toString()
  );
  profile.notifications = notifications;
  await profile.save();

  res.response = new Response(200, profile);
  next();
});
