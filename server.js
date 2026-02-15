const express = require("express");
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;


// ================== ใส่ API ตรงนี้ ==================
cloudinary.config({
  cloud_name: "Root",
  api_key: "188179442839638",
  api_secret: "jo7TFoLw7pqdskyeyQj7W0oe3HY",
});


// ================= static =================
app.use(express.static("public"));


// ================= หน้าแรก =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ================= multer (ไฟล์ชั่วคราว) =================
const upload = multer({ dest: "temp/" });


// ================= upload =================
app.post("/upload/:month", upload.single("file"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "memory/" + req.params.month,
      resource_type: "auto",
    });

    // ลบไฟล์ชั่วคราว
    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================= list files =================
// ⚠️ cloud ไม่ต้อง list จาก server แล้ว
// ปล่อยให้หน้าเว็บจำ URL เอง
app.get("/files/:month", (req, res) => {
  res.json([]);
});


// ================= start server =================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
