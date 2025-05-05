const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const path = require('path');
const connectToDB = require('./config/db');
const indexRouter = require('./routes/index.routes');
const userRouter = require('./routes/user.routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

connectToDB();

app.use(session({
    secret: process.env.SESSION_SECRET,  // Use a secret for encrypting session data
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
    done(null, user);  // Store user information in the session
});
  
passport.deserializeUser((user, done) => {
    done(null, user);  // Retrieve user information from session
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback',  // Redirect URI from Google Developer Console
},
function (token, tokenSecret, profile, done) {
    // In a real application, you'd store the profile in the database
    return done(null, profile);
}));

app.set('view engine', "ejs");
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],  // You can request more permissions here
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
    const user = req.user;
    const payload = {
      id: user.id,
      displayName: user.displayName,
      email: user.emails[0].value
    };
    const token = jwt.sign(payload, 'secretkey', { expiresIn: '1h' });
    res.cookie('token', token);
    res.redirect('/profile');  // Redirect to profile after successful login
    }
);

app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/');
    }
    res.redirect('/drive');
});

app.use('/drive', indexRouter);
app.use('/user', userRouter);

app.listen(3000);