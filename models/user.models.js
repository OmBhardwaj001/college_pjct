const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            trim: true
        },
        lastname: {
            type: String
        }
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    }
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

module.exports = User;