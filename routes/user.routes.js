const express = require('express');
const router = express.Router();
const userModel = require('../models/user.models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

router.get('/register', (req, res) => {
    res.render('register');
})

router.post('/register', async (req, res) => {
    const {fullname, email, password} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        fullname: {
            firstname: fullname.firstname,
            lastname: fullname.lastname
        },
        email,
        password: hashedPassword
    })

    const token = jwt.sign(
        {
            userId: user._id,
            email: user.email,
            fullname: user.fullname,
        },
        "secretkey"
    );

    res.cookie("token", token);

    res.redirect('/drive');
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    
    const user = await userModel.findOne({email});

    if(!user) {
        return res.status(400).json({
            message: "email or password is incorrect"
        })
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        return res.status(400).json({
            message: "email or password is incorrect"
        })
    }

    const token = jwt.sign({
        userId: user._id,
        email: user.email,
        fullname: user.fullname
    }, "secretkey");

    res.cookie("token", token);
    res.redirect("/drive");
});

router.get('/logout', (req, res) => {
    res.cookie("token", "");

    res.redirect('/user/register');
})

module.exports = router;