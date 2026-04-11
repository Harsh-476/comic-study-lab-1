import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Upload from "../models/Upload.js";
import User from "../models/user.js";

dotenv.config();

const router = express.Router();

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9.\-_]/g, "_")
      .slice(-120);
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const upload = multer({ storage });

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;

    if (!req.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    let resolvedRole = payload.role;
    if (!resolvedRole) {
      const user = await User.findById(req.userId).select("role");
      resolvedRole = user?.role;
    }

    req.userRole = resolvedRole || "user";

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const countWords = (text = "") =>
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

router.get("/", authenticate, async (_req, res) => {
  try {
    const uploads = await Upload.find().sort({ createdAt: -1 });
    res.json(uploads);
  } catch (error) {
    console.error("Fetch uploads error", error.message);
    res.status(500).json({ message: "Unable to fetch uploads" });
  }
});

router.post("/", authenticate, upload.single("file"), async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const description = req.body.description?.trim() || "";
    const trimmedLink = req.body.link?.trim() || "";
    const hasFile = Boolean(req.file);
    const hasDescription = Boolean(description);
    const hasLink = Boolean(trimmedLink);

    if (!hasDescription && !hasLink && !hasFile) {
      return res
        .status(400)
        .json({ message: "Provide at least a description, link, or file." });
    }

    if (hasLink) {
      try {
        const parsed = new URL(trimmedLink);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return res.status(400).json({ message: "Link must start with http:// or https://" });
        }
      } catch {
        return res.status(400).json({ message: "Link must be a valid URL" });
      }
    }

    if (hasDescription && countWords(description) > 1000) {
      return res.status(400).json({ message: "Description cannot exceed 1000 words" });
    }

    const uploadPayload = {
      uploadedBy: req.userId,
    };

    if (hasDescription) {
      uploadPayload.description = description;
    }

    if (hasLink) {
      uploadPayload.link = trimmedLink;
    }

    if (hasFile) {
      uploadPayload.fileName = req.file.filename;
      uploadPayload.originalName = req.file.originalname;
      uploadPayload.fileType = req.file.mimetype;
      uploadPayload.fileSize = req.file.size;
      uploadPayload.fileUrl = `/uploads/${req.file.filename}`;
    }

    const newUpload = await Upload.create(uploadPayload);

    res.status(201).json(newUpload);
  } catch (error) {
    console.error("Upload file error", error.message);
    res.status(500).json({ message: "Unable to upload file" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;
    const upload = await Upload.findById(id);

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    // Delete the physical file
    const filePath = upload.fileName ? path.join(uploadDir, upload.fileName) : null;
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the database record
    await Upload.findByIdAndDelete(id);

    res.json({ message: "Upload deleted successfully" });
  } catch (error) {
    console.error("Delete upload error", error.message);
    res.status(500).json({ message: "Unable to delete upload" });
  }
});

export default router;
