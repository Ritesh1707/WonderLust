const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { savedRedirectUrl } = require("../middleware");
const usersControllers = require("../controllers/usersControllers");


router.route('/signup')
  .get( wrapAsync(usersControllers.renderSignUpForm))
  .post( savedRedirectUrl, wrapAsync(usersControllers.signup))


router.route('/login')
  .get(wrapAsync(usersControllers.renderLoginForm))
  .post(savedRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(usersControllers.login))


// Logout
router.get("/logout", usersControllers.logout);

module.exports = router;
