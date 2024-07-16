if(process.env.NODE_DEV !='production'){
  require('dotenv').config()
}
const initDB = require('./init/index')
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const engine = require('ejs-mate');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ExpressError = require('./utils/ExpressError');
const User = require('./models/user');

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(flash());
const dbUrl = process.env.ATLASDB_URL;
const store = MongoStore.create({
   mongoUrl: dbUrl,
   touchAfter: 24 * 3600,
   crypto: {
    secret: process.env.SECRET  
  },
  })

store.on('error',()=>{
  console.log('Error in session store');
})

app.use(session({
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 24 * 60 * 60 * 1000,
    maxAge: Date.now() + 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Importing routes
const listingRoutes = require('./routes/listing');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user');


// Using routes
app.use('/listings', listingRoutes);
app.use('/listings/:id',reviewRoutes);
app.use('/',userRoutes);

// Database connection
async function main() {
  await mongoose.connect(dbUrl);
}
main();
initDB();
// Other routes and error handling


app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Some error occurred" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(5500, () => {
  console.log("Server is running on port 5500");
});