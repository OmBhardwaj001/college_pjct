const express = require('express');
const router = express.Router();
const multer = require('multer');
const {storage} = require('../config/cloud.config');
const upload = multer({ storage });
const fileModel = require('../models/files.models');
const auth = require('../middlewares/auth');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const {PassThrough} = require('stream');

router.get('/', auth, async (req, res) => {
    const userFiles = await fileModel.find({user: req.user.userId});

    const user = req.user;
    
    res.render('dashboard', {files: userFiles, user: user});
})

router.post('/upload', auth,  upload.single("file"), async (req, res) => {
    console.log(req.file);
    
    const newFile = await fileModel.create({
        path: req.file.path,
        originalName: req.file.originalname,
        user: req.user.userId,
        type: req.file.mimetype,
        size: req.file.size
    })

    res.redirect('/drive');
});

router.get('/download/:path', auth, async (req, res) => {
    const loggedInUserId = req.user.userId;
    const filePath = req.params.path;

    // Find the file in your database
    const file = await fileModel.findOne({
        user: loggedInUserId,
        path: filePath,
    });

    if (!file) {
        console.log('File not found');
        return res.status(404).json({ message: 'File not found' });
    }

    // Check if the file is hosted on Cloudinary
    if (file.path.startsWith('https://res.cloudinary.com')) {
        // Stream the file directly from Cloudinary without redirecting
        try {
            const cloudinaryUrl = file.path; // Cloudinary file URL
            console.log('Streaming file from Cloudinary:', cloudinaryUrl);

            const response = await axios({
                method: 'get',
                url: cloudinaryUrl,
                responseType: 'stream', // We want the response as a stream
            });

            // Set the correct headers for downloading the file
            res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
            res.setHeader('Content-Type', response.headers['content-type']);

            // Pipe the Cloudinary response to the client (streams the file)
            response.data.pipe(res);
        } catch (error) {
            console.error('Error streaming file from Cloudinary:', error);
            return res.status(500).send("Error while streaming the file from Cloudinary.");
        }
    } else {
        // If it's a local file, check if it exists on the server
        const localFilePath = path.join(__dirname, file.path);
        console.log("Local file path:", localFilePath);

        if (!fs.existsSync(localFilePath)) {
            console.log('File does not exist at path:', localFilePath);
            return res.status(404).json({ message: 'File does not exist on the server' });
        }

        // If the file exists, proceed with downloading
        console.log('File exists locally, proceeding with download');
        res.download(localFilePath, file.originalName, (err) => {
            if (err) {
                console.error("Error downloading local file:", err);
                return res.status(500).send("Server error while downloading the file.");
            }
        });
    }
});

module.exports = router;