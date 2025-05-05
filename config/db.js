const mongoose = require('mongoose');

function connectToDB () {
    mongoose.connect('mongodb://127.0.0.1:27017/testdrive').then(() => {
        console.log("db connected");
    })
}

module.exports = connectToDB