import express from "express";
import multer from "multer";
import {
  uploadFile,
  getProgress,
  getFileContent,
  listFiles,
  deleteFile,
} from "../controllers/fileController.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowed = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf",
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only CSV, Excel (.xls/.xlsx), and PDF are supported"));
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

router.post("/", upload.single("file"), uploadFile);
router.get("/:file_id/progress", getProgress);
router.get("/:file_id", getFileContent);
router.get("/", listFiles);
router.delete("/:file_id", deleteFile);

export default router;
