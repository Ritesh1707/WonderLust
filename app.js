const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path =  require('path')
const engine = require('ejs-mate')
app.engine('ejs', engine);
const methodOverride= require("method-override")
app.use(methodOverride('_method'))
const {isLoggedIn, isReviewAuthor, isOwner, savedRedirectUrl,validateListing, validateReview} = require('./middleware.js')
// const {validateListing, validateReview} = require('./middleware.js')
// const {savedRedirectUrl} = require('./middleware.js')


const Listing =  require('./models/listing.js')
const Review = require("./models/reviews.js");
const User = require('./models/user.js');

const flash = require("connect-flash")

app.use(flash())
const session = require("express-session")
app.use(session({secret:"mysupersecretcode",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires :Date.now() + 24*60*60*1000,
    maxAge: Date.now() + 24*60*60*1000,
    httpOnly :true
  }
}))

const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportLocalMongoose = require('passport-local-mongoose')

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const wrapAsync = require('./utils/wrapAsync.js')
const ExpressError = require('./utils/ExpressError.js')
const { listingValidation, reviewValidation } = require('./schema.js')


const { log } = require('console');

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')))

async function main(){
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
}
main()


app.listen(5500, ()=>{
    console.log("Server is running on port 5500");
})



app.get('/demouser', async(req,res)=>{
  let demo = new User({
    email : 'demomail@mail.com',
    username : 'RiteshNagpal'
  })
  let bete = await User.register(demo, 'password'); 
  res.send(bete)
})

app.get('/testListing',(req,res)=>{
  let newL = new Listing({
    title: "MUJ",
    description:"Jaipur Top college",
    price:"330K",
    location:"Jaipur",
    country:"India"
  })
  newL.save().then()
  res.send("Data saved")  
  console.log("Data saved")   
})

app.use((req,res,next)=>{
  res.locals.successMsg = req.flash("success"); 
  res.locals.errorMsg = req.flash("error");
  res.locals.currUser = req.user;
  next();
})

//All Listings
//Show route
app.get("/listings",wrapAsync(async(req,res)=>{
  let allListing =  await Listing.find().populate('owner')
  res.render('listing/index.ejs',{allListing})
}))
app.get("/",wrapAsync(async(req,res)=>{
  let allListing =  await Listing.find().populate('owner')
res.render('listing/index.ejs',{allListing})
}))

// Show route
//Specific Page 
app.get("/listing/:id", wrapAsync(async(req,res)=>{
  let {id} = req.params;
  let listing = await Listing.findById(id)
  .populate('owner')
  .populate({
    path:'reviews',
    populate:{
      path:'author'
    }
  });
  if (!listing){
    req.flash("error","The page doesn't exist")
    res.redirect("/")
  }
  res.render('listing/show.ejs',{listing})
}))

//Form to add new 
// Create route
app.get('/listings/new',isLoggedIn,(req,res)=>{
  res.render('listing/new.ejs') 
})

app.post('/listings', isLoggedIn, validateListing, wrapAsync(async(req,res,next)=>{
  // let newData = new Listing({ ...req.body});
  // newData.owner = req.user._id;
  let newData = new Listing({ ...req.body, owner: req.user._id}); //user info in req object is stored by passport  
  await newData.save();
  req.flash("success", "New Listing Added");
  res.redirect('/listings')
}))



//Update
app.get('/listings/:id/edit', isLoggedIn, isOwner, wrapAsync(async(req,res)=>{
  let {id} = req.params;
  let listing = await Listing.findById(id);
  if(!listing){
  req.flash("error", "Listing you requested for does not exist");
  return res.redirect("/");
  }
  res.render('listing/edit.ejs',{listing})
}))

app.put('/listings/:id', isLoggedIn, isOwner, validateListing, wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body})
    await Listing.findByIdAndUpdate(id, {...req.body})
    res.redirect('/listings');
}))

//Delete 
app.get("/listings/:id/delete",isLoggedIn, isOwner, wrapAsync(async(req,res)=>{
  let {id} = req.params;
  await Listing.findByIdAndDelete(id)
  req.flash("success", "Deleted successfully");
  res.redirect('/listings')
}))

//Reviews
//Post reviews route
app.post('/listings/:id/reviews', isLoggedIn, validateReview, wrapAsync(async(req,res)=>{
  let list = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);  
  newReview.author = req.user._id;
  list.reviews.push(newReview);
  await newReview.save();
  await list.save();
  res.redirect(`/listing/${req.params.id}`) 
}))

//Delete review route
app.delete('/listings/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor,wrapAsync(async(req,res)=>{
  let {id,reviewId} = req.params;
  await Review.findByIdAndDelete(reviewId)
  await Listing.findByIdAndUpdate(id, {$pull:{ reviews : reviewId  }})
  res.redirect(`/listing/${id}`) 
}))



//User router 
app.get('/signup',wrapAsync(async(req,res)=>{
  res.render('users/signup.ejs')
}))

app.post('/signup',wrapAsync(async(req,res)=>{
  try{
    let {username, password, email} = req.body;
    let newUser = new User({email, username})
    let registeredUser = await User.register(newUser, password);
    req.login(registeredUser,(err)=>{
      if(err){
        return next(err)
      }
      req.flash('success','Sign up successfully')
      res.redirect('/')
    })
  }catch(err){
    if(err){
      req.flash('error',err.message)
      res.redirect('/signup')
    }
  }
}))

app.get('/login',wrapAsync(async(req,res)=>{
  res.render('users/login.ejs')
}))

app.post('/login', savedRedirectUrl,passport.authenticate('local',{failureRedirect:'/login', failureFlash:true}),wrapAsync(async(req,res)=>{
  req.flash('success','Welcome back chief')
  res.redirect(res.locals.redirectUrl || '/');
}))

app.get('/logout',(req,res)=>{
  req.logout((err)=>{
    if(err){
      next(err);
    }else{
      res.redirect('/');
    }
  })
})




app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page not found"))
})

app.use((err, req, res, next) => {
  let {statusCode = 500, message = "Some error occurred"}= err;
  res.status(statusCode).render("error.ejs", { err });
});