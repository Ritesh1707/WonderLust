const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const { savedRedirectUrl } = require('../middleware');

// Sign up
router.get('/signup', wrapAsync(async (req, res) => {
  res.render('users/signup.ejs');
}));

router.post('/signup', wrapAsync(async (req, res) => {
  try {
    let { username, password, email } = req.body;
    let newUser = new User({ email, username });
    let registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Sign up successfully');
      res.redirect('/');
    });
  } catch (err) {
    if (err) {
      req.flash('error', err.message);
      res.redirect('/signup');
    }
  }
}));

// Login
router.get('/login', wrapAsync(async (req, res) => {
  res.render('users/login.ejs');
}));

router.post('/login', savedRedirectUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), wrapAsync(async (req, res) => {
  req.flash('success', 'Welcome back chief');
  res.redirect(res.locals.redirectUrl || '/');
}));

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      next(err);
    } else {
      res.redirect('/');
    }
  });
});

module.exports = router;
