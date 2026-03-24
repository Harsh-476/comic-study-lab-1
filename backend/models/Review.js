import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: String },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Review", reviewSchema);