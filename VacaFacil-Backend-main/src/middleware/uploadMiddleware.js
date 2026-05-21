const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function fileFilter(_req, file, cb) {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens JPG, PNG ou WEBP são permitidas"));
  }
}

// Armazena em memória e envia para o Cloudinary no controller
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

async function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

async function deleteFromCloudinary(url) {
  if (!url || !url.includes("cloudinary.com")) return;
  try {
    // Extrai public_id correto: tudo após "/upload/vXXXX/" sem extensão
    // Ex: ".../upload/v1234/vacafacil/vacas/abc.jpg" → "vacafacil/vacas/abc"
    const [, afterUpload] = url.split("/upload/");
    if (!afterUpload) return;
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    const publicId = withoutVersion.replace(/\.[^/.]+$/, "");
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // ignora erro se imagem já não existe
  }
}

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
