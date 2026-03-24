import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/uploads.js";
import Review from "./models/Review.js"; // ⚠️ adjust path if needed

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || "";

// ✅ CORS CONFIG
const FRONTEND_URLS = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (FRONTEND_URLS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS policy: This origin is not allowed."));
  },
  credentials: true,
};

// ✅ Apply CORS ONCE
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.resolve("uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Comics Studies Lab backend is running" });
});

// Example review route
app.post("/api/reviews", async (req, res) => {
  try {
    const { reviewText, user } = req.body;

    if (!reviewText) {
      return res.status(400).json({ message: "Review text is required" });
    }

    await Review.create({
      text: reviewText,
      user,
      date: new Date(),
    });

    res.json({ message: "Review submitted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
async function startServer() {
  if (!MONGODB_URI) {
    console.error("Please set MONGODB_URI in your .env file before starting the server.");
    process.exit(1);
  }

  if (!JWT_SECRET) {
    console.error("Please set JWT_SECRET in your .env file before starting the server.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();