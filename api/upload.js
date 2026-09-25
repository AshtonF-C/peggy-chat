const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { image, fileName } = req.body;

    if (!image || !fileName) {
      return res.status(400).json({
        error: "Missing image or file name"
      });
    }

    // Remove the data URL prefix
    const match = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

    if (!match) {
      return res.status(400).json({
        error: "Invalid image format"
      });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const extension =
      mimeType === "image/jpeg" ? "jpg" :
      mimeType === "image/png" ? "png" :
      mimeType === "image/webp" ? "webp" :
      "jpg";

    const safeName =
      `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const uploadDir = path.join("/tmp", "matechat");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, safeName);

    fs.writeFileSync(
      filePath,
      Buffer.from(base64Data, "base64")
    );

    return res.status(200).json({
      success: true,
      fileName: safeName,
      message: "Image uploaded"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Upload failed"
    });
  }
};
