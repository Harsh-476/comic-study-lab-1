import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    segment: {
      type: String,
      enum: ["projects", "comics", "videos"],
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 10000,
    },
    link: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
    },
    originalName: {
      type: String,
    },
    fileType: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    fileUrl: {
      type: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Upload = mongoose.model("Upload", uploadSchema);

export default Upload;
