const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ให้เว็บเรียกไฟล์ใน public
app.use(express.static("public"));

// ให้เข้าถึง uploads
app.use("/uploads", express.static("uploads"));

// เข้าเว็บหลัก → เปิด index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// ถ้าไม่มี uploads ให้สร้าง
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ตั้งค่าการเก็บไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const month = req.params.month;
    const dir = `uploads/${month}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// upload
app.post("/upload/:month", upload.single("file"), (req, res) => {
  res.json({ url: `/uploads/${req.params.month}/${req.file.filename}` });
});

// list files
app.get("/files/:month", (req, res) => {
  const dir = `uploads/${req.params.month}`;
  if (!fs.existsSync(dir)) return res.json([]);
  const files = fs.readdirSync(dir).map(f => `/uploads/${req.params.month}/${f}`);
  res.json(files);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
