const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `intrusion-${Date.now()}.jpg`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  }
});

app.use("/uploads", express.static(uploadDir));

app.get("/", (req, res) => {
  res.json({ message: "Anti-Theft System Backend is running!" });
});

app.get("/api/status", (req, res) => {
  res.json({ server: "online", camera: "not connected yet", door: "not connected yet" });
});

app.post("/api/images/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });

  res.status(201).json({
    message: "Image uploaded successfully",
    filename: req.file.filename,
    timestamp: new Date().toISOString(),
    imageUrl: `/uploads/${req.file.filename}`
  });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
  res.status(400).json({ error: err.message || "Upload failed" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
