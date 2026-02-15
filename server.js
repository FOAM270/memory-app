const express = require("express");
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// ================== Cloudinary ==================
cloudinary.config({
  cloud_name: "dhzcni338",
  api_key: "188179442839638",
  api_secret: "jo7TFoLw7pqdskyeyQj7W0oe3HY",
});


// ================== static ==================
app.use(express.static("public"));


// ================== data file ==================
const DATA_FILE = "data.json";

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch {
    return {};
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}


// ================== หน้าแรก ==================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ================== multer ==================
const upload = multer({ dest: "temp/" });


// ================== upload ==================
app.post("/upload/:month", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no file" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "memory/" + req.params.month,
      resource_type: "auto",
    });

    fs.unlinkSync(req.file.path);

    const data = readData();
    if (!data[req.params.month]) data[req.params.month] = [];

    // เพิ่มไว้ด้านหน้า → รูปล่าสุดขึ้นก่อน
    data[req.params.month].unshift(result.secure_url);

    writeData(data);

    res.json({ url: result.secure_url });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


// ================== list files ==================
app.get("/files/:month", (req, res) => {
  const data = readData();
  res.json(data[req.params.month] || []);
});


// ================== delete ==================
app.post("/delete", async (req, res) => {
  try {
    const { month, url } = req.body;
    if (!month || !url) return res.status(400).json({ error: "missing data" });

    const data = readData();
    if (!data[month]) return res.json({});

    data[month] = data[month].filter(u => u !== url);
    writeData(data);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================== start ==================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
