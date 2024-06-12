const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path =  require('path')
const engine = require('ejs-mate')
app.engine('ejs', engine);
const methodOverride= require("method-override")
app.use(methodOverride('_method'))

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

function validateListing(req,res,next){
  let result = listingValidation.validate(req.body);
  if (result.error){
    throw new ExpressError(400,result.error);
  }
  else{
    next();
  }
}

function validateReview(req,res,next){
  let result = reviewValidation.validate(req.body);
  if (result.error){
    throw new ExpressError(400,result.error);
  }
  else{
    next();
  }
}

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
  next();
})

//All Listings
//Show route
app.get("/listings",wrapAsync(async(req,res)=>{
  let allListing =  await Listing.find()
  res.render('listing/index.ejs',{allListing})
}))
app.get("/",wrapAsync(async(req,res)=>{
  let allListing =  await Listing.find()
  res.render('listing/index.ejs',{allListing})
}))

//Specific Page 
app.get("/listing/:id", wrapAsync(async(req,res)=>{
  let {id} = req.params;
  let listing = await Listing.findById(id).populate('reviews');
  if (!listing){
    req.flash("error","The page doesn't exist")
    res.redirect("/")
  }
  res.render('listing/show.ejs',{listing})
}))

//Form to add new 
// Create route
app.get('/listings/new',(req,res)=>{
  res.render('listing/new.ejs') 
})

app.post('/listings', validateListing, wrapAsync(async(req,res,next)=>{
  let newData = new Listing({ ...req.body });  
  await newData.save();
  req.flash("success", "New Listing Added");
  res.redirect('/listings')
}))



//Update
app.get('/listings/:id/edit',wrapAsync(async(req,res)=>{
  let {id} = req.params;
  let listing = await Listing.findById(id);
  if(!listing){
  req.flash("error", "Listing you requested for does not exist");
  res.redirect("/")
  }
  res.render('listing/edit.ejs',{listing})
}))

app.put('/listings/:id',validateListing ,wrapAsync(async(req,res)=>{
  let {id} = req.params;
  //id not found modification
  await Listing.findByIdAndUpdate(id, {...req.body})
  res.redirect('/listing')
}))

//Delete 
app.get("/listings/:id/delete",wrapAsync(async(req,res)=>{
  let {id} = req.params;
  await Listing.findByIdAndDelete(id)
  req.flash("success", "Deleted successfully");
  res.redirect('/listings')
}))

//Reviews
//Post reviews route
app.post('/listings/:id/reviews', validateReview, wrapAsync(async(req,res)=>{
  let list = await Listing.findById(req.params.id)
  let newReview = new Review(req.body.review)  
  list.reviews.push(newReview)

  await newReview.save()
  await list.save()
  res.redirect(`/listing/${req.params.id}`) 
}))

//Delete review route
app.delete('/listings/:id/reviews/:reviewId',wrapAsync(async(req,res)=>{
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
    let result = await User.register(newUser, password);
    console.log(result)
    req.flash('success','Sign up successfully')
    res.redirect('/')
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

app.get('/login',passport.authenticate(),wrapAsync(async(req,res)=>{
  res.redirect('/')
}))




app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page not found"))
})

app.use((err, req, res, next) => {
  let {statusCode = 500, message = "Some error occurred"}= err;
  res.status(statusCode).render("error.ejs", { err });
});