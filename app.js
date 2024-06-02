const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path =  require('path')
const engine = require('ejs-mate')
app.engine('ejs', engine);
const methodOverride= require("method-override")
app.use(methodOverride('_method'))

const wrapAsync = require('./utils/wrapAsync.js')
const ExpressError = require('./utils/ExpressError.js')
const { listingValidation, reviewValidation } = require('./schema.js')

const Listing =  require('./models/listing.js')
const Review = require("./models/reviews.js");
const data = require('./init/data.js');
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

//All Listings
//Show route
app.get("/listing",wrapAsync(async(req,res)=>{
  let allListing =  await Listing.find()
  res.render('listing/index.ejs',{allListing})
}))
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
  res.render('listing/show.ejs',{listing})
}))

//Form to add new 
// Create route
app.get('/listing/new',(req,res)=>{
  res.render('listing/new.ejs') 
})

app.post('/listings', validateListing, wrapAsync(async(req,res,next)=>{
  let newData = new Listing({ ...req.body });
  await newData.save();
  res.redirect('/listing')
}))



//Update
app.get('/listings/:id/edit',wrapAsync(async(req,res)=>{
  let {id} = req.params;
  let listing = await Listing.findById(id);
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
  res.redirect('/listing')
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





app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page not found"))
})

app.use((err, req, res, next) => {
  let {statusCode = 500, message = "Some error occurred"}= err;
  res.status(statusCode).render("error.ejs", { err });
});