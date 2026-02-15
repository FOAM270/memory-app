const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// ให้เว็บเรียกไฟล์ใน public ได้
app.use(express.static("public"));

// ให้เข้าถึงรูปที่อัปโหลด
app.use("/uploads", express.static("uploads"));

// ถ้าไม่มีโฟลเดอร์ uploads ให้สร้าง
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

// อัปโหลด
app.post("/upload/:month", upload.single("file"), (req, res) => {
  res.json({ file: req.file.filename });
});

// ดึงรายการรูป
app.get("/files/:month", (req, res) => {
  const month = req.params.month;
  const dir = `uploads/${month}`;
  if (!fs.existsSync(dir)) return res.json([]);
  res.json(fs.readdirSync(dir));
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
