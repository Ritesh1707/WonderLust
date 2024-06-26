const User = require('../models/user');

module.exports.renderSignUpForm = async (req, res) => {
    res.render('users/signup.ejs');
};

module.exports.signup = async (req, res) => {
    try {
      let { username, password, email } = req.body;
      let newUser = new User({ email, username });
      let registeredUser = await User.register(newUser, password);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash('success', 'Sign up successfully');
        res.redirect(res.locals.redirectUrl || '/listings');
      });
    } catch (err) {
      if (err) {
        req.flash('error', err.message);
        res.redirect( '/signup');
      }
    }
};

module.exports.renderLoginForm  = async (req, res) => {
    res.render('users/login.ejs');
};

module.exports.login = async (req, res) => {
    req.flash('success', 'Welcome back chief');
    res.redirect(res.locals.redirectUrl || '/listings');
};

module.exports.logout = (req, res) => {
    req.logout((err) => {
      if (err) {
        next(err);
      } else {
        res.redirect('/listings');
      }
    });
  };