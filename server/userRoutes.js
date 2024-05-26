import express from "express";
import User from "./schema/userSchema.js";
import jwt from "jsonwebtoken";
import imageRouter from "./uploadImage.js";
import dotenv from "dotenv";

dotenv.config();

const userRoutes = express.Router();

userRoutes.get("/", async (req, res) => {
  try {
    const users = await User.find();
    const userNames = users.map((user) => ({
      name: user.name,
      joinedAt: user.createdAt,
    }));
    res.json(userNames);
  } catch (err) {
    res.json({ error: `An error occurred while getting the data. ${err}` });
  }
});

userRoutes.post("/add-user", async (req, res) => {
  const newUser = new User({
    userID: req.body.userID,
    name: req.body.name,
    image: req.body.image,
    email: req.body.email,
    password: req.body.password,
    mobileNumber: req.body.mobileNumber,
    friends: req.body.friends,
    trips: req.body.trips,
    posts: req.body.posts,
    badges: req.body.badges,
  });
  try {
    const saveUser = await newUser.save();
    res.json(`${newUser.name} joined Roamio successfully.🎉`);
    console.log(`${newUser.name} joined Roamio successfully.🎉`);
  } catch (err) {
    console.log("Error occurred while adding the user " + err);
    res
      .status(500)
      .json({ error: "An error occurred while adding you to our database." });
  }
});

userRoutes.get("/userExist", async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ message: "User not found", userFound: false });
    }
    return res.status(200).json({ message: "User found", userFound: true });
  } catch (error) {
    console.error(
      "Error encountered while verifying user existence in the database.",
      error
    );
    return res.status(500).json({
      message:
        "Error encountered in server while verifying user existence in the database.",
    });
  }
});

userRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const passwordMatch = password === user.password;
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password! Please try again." });
    }
    const token = jwt.sign({ userId: user._id }, process.env.SECRET, {
      expiresIn: "1h",
    });
    console.log(`${user.name} verified successfully !🎉`);
    return res
      .status(200)
      .json({ message: `${user.name} logged in successfully !🎉`, token });
  } catch (error) {
    console.error("Error while logging in", error);
    return res.status(500).json({
      message: "Internal server error encountered while logging a user in.",
    });
  }
});

userRoutes.use("/uploadProfile", imageRouter);

export default userRoutes;
