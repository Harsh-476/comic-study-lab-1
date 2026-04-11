import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

const router = express.Router();
console.log("AUTH LOADED");

const getJwtSecret = () => process.env.JWT_SECRET;

router.post("/signup", async (req, res) => {
  try {
    const { name, email, age, gender, country, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(500).json({ message: "Server missing JWT secret" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      age,
      gender,
      country,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: newUser._id, role: newUser.role || "user" }, jwtSecret, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        gender: newUser.gender,
        country: newUser.country,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Signup error", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return res.status(500).json({ message: "Server missing JWT secret" });
    }

    const role = user.role || "user";
    const token = jwt.sign({ userId: user._id, role }, jwtSecret, { expiresIn: "7d" });

    res.json({
      message: "Signed in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        country: user.country,
        role,
      },
    });
  } catch (error) {
    console.error("Signin error", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
