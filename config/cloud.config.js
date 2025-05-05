const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'cryptdrive',
      allowedFormats: [
        "jpeg", "jpg", "png", "gif", "bmp", "webp", "svg", "tiff", "ico",   // Image formats
        "mp4", "mov", "avi", "wmv", "flv", "3gp", "mkv", "webm", "ogg",       // Video formats
        "mp3", "aac", "flac", "ogg", "wav", "webm",                          // Audio formats
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv",     // Document formats
        "rtf", "odt", "ods"                                                  // More document formats
      ]
    },
});

module.exports = {
    cloudinary,
    storage
}