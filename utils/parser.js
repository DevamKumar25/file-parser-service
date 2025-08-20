const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const pdfParse = require("pdf-parse");
const File = require("../models/File");


let lastSave = 0;
async function saveWithThrottle(doc, minIntervalMs = 200) {
  const now = Date.now();
  if (now - lastSave >= minIntervalMs) {
    lastSave = now;
    await doc.save();
  }
}

async function parseCSV(filePath, fileDoc) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", async (row) => {
        rows.push(row);
        if (fileDoc.progress < 90) {
          fileDoc.progress += 1;
          await saveWithThrottle(fileDoc);
        }
      })
      .on("end", async () => {
        fileDoc.parsedContent = rows;
        fileDoc.progress = 100;
        fileDoc.status = "ready";
        await fileDoc.save();
        resolve();
      })
      .on("error", async (err) => {
        fileDoc.status = "failed";
        fileDoc.error = err.message;
        await fileDoc.save();
        reject(err);
      });
  });
}

async function parseXLSX(filePath, fileDoc) {
  try {
    // XLSX reads whole file; okay for moderate sizes
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames || [];

    // Convert all sheets to JSON and combine with a sheet label
    const all = [];
    sheetNames.forEach((name, idx) => {
      const ws = workbook.Sheets[name];
      const sheetRows = xlsx.utils.sheet_to_json(ws, { defval: null }); // keep empty cells
      all.push({ sheet: name || `Sheet${idx + 1}`, rows: sheetRows });
      // update progress as we finish each sheet
      const progress = Math.min(
        90,
        Math.floor(((idx + 1) / sheetNames.length) * 90)
      );
      fileDoc.progress = progress;
    });

    await fileDoc.save();

    // Flatten or store as-is. Here we store array of {sheet, rows}
    fileDoc.parsedContent = all;
    fileDoc.progress = 100;
    fileDoc.status = "ready";
    await fileDoc.save();
  } catch (err) {
    fileDoc.status = "failed";
    fileDoc.error = err.message;
    await fileDoc.save();
    throw err;
  }
}

async function parsePDF(filePath, fileDoc) {
  try {
    // pdf-parse returns text; we’ll split by pages/paragraphs into array for consistency
    const data = await pdfParse(fs.readFileSync(filePath));
    // Rough split: by double newlines into paragraphs
    const paragraphs = (data.text || "")
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    // Simulate progress by chunks
    const total = paragraphs.length || 1;
    const chunks = Math.max(1, Math.floor(total / 20));
    for (let i = 0; i < total; i += chunks) {
      fileDoc.progress = Math.min(90, Math.floor(((i + chunks) / total) * 90));
      await saveWithThrottle(fileDoc);
    }

    fileDoc.parsedContent = paragraphs.map((p, i) => ({
      index: i + 1,
      text: p,
    }));
    fileDoc.progress = 100;
    fileDoc.status = "ready";
    await fileDoc.save();
  } catch (err) {
    fileDoc.status = "failed";
    fileDoc.error = err.message;
    await fileDoc.save();
    throw err;
  }
}

function detectType(fileDoc) {
  const ext = path.extname(fileDoc.filename || "").toLowerCase();
  const mt = (fileDoc.mimetype || "").toLowerCase();

  if (ext === ".csv" || mt === "text/csv") return "csv";
  if (
    ext === ".xlsx" ||
    ext === ".xls" ||
    mt.includes("spreadsheet") ||
    mt.includes("excel")
  )
    return "xlsx";
  if (ext === ".pdf" || mt === "application/pdf") return "pdf";
  return "unknown";
}

async function parseFile(filePath, fileDoc) {
  const kind = detectType(fileDoc);
  if (!filePath) throw new Error("filePath is undefined in parseFile");

  if (kind === "csv") return parseCSV(filePath, fileDoc);
  if (kind === "xlsx") return parseXLSX(filePath, fileDoc);
  if (kind === "pdf") return parsePDF(filePath, fileDoc);

  
  fileDoc.status = "failed";
  fileDoc.error =
    "Unsupported file type. Only CSV, Excel, and PDF are supported.";
  await fileDoc.save();
  throw new Error(fileDoc.error);
}

module.exports = { parseFile };
