const fs = require("fs");
const path = require("path");
const File = require("../models/File");
const { parseFile } = require("../utils/parser");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // save metadata
    const file = new File({
      filename: req.file.originalname,
      filepath: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      status: "processing",
      progress: 0,
    });
    await file.save();

    // parse in background (non-blocking)
    const fullFilePath = path.resolve(file.filepath);
    parseFile(fullFilePath, file).catch((err) => {
      console.error("Parse error:", err);
    });

    // respond immediately
    res.json({ file_id: file._id, status: file.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const file = await File.findById(req.params.file_id);
    if (!file) return res.status(404).json({ error: "File not found" });

    res.json({
      file_id: file._id,
      status: file.status,
      progress: file.progress ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFileContent = async (req, res) => {
  try {
    const file = await File.findById(req.params.file_id);
    if (!file) return res.status(404).json({ error: "File not found" });

    if (file.status !== "ready") {
      return res.json({
        message:
          "File upload or processing in progress. Please try again later.",
        status: file.status,
        progress: file.progress ?? 0,
      });
    }

    res.json({ file_id: file._id, content: file.parsedContent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const files = await File.find()
      .sort({ createdAt: -1 })
      .select("-parsedContent"); // lighter list
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.file_id);
    if (!file) return res.status(404).json({ error: "File not found" });

    // Optional: remove actual uploaded file from disk
    try {
      if (file.filepath && fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
    } catch (e) {
      console.warn("Failed to unlink uploaded file:", e.message);
    }

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
