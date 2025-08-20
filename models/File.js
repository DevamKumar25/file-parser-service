const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,
  filepath: String,
  mimetype: String,
  size: Number,
  status: {
    type: String,
    enum: ["uploading", "processing", "ready", "failed"],
    default: "uploading",
  },
  progress: { type: Number, default: 0 },
  parsedContent: { type: Array, default: [] }, // for CSV/XLSX rows; for PDF we’ll store pages/paragraphs in an array
  error: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", fileSchema);
