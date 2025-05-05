const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    path: {
        type: String
    },
    originalName: {
        type: String
    },
    size: {
        type: Number
    },
    type: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

const File = mongoose.model("File", fileSchema);

module.exports = File;