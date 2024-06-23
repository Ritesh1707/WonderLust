const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const { listingValidation, reviewValidation } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "User login requires");
    return res.redirect("/login");
  }
  next();
};

module.exports.isOwner = async(req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate('owner');    
    if(!listing.owner._id.equals(res.locals.currUser._id)){
      req.flash('error','You cannot make changes!');
      return res.redirect(`/listing/${id}`);
    }
    next();
};

module.exports.savedRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.validateListing = async (req, res, next) => {
  let result = listingValidation.validate(req.body);
  if (result.error) {
    throw new ExpressError(400, result.error);
  } else {
    next();
  }
};

module.exports.validateReview = async(req,res,next)=>{
    let result = reviewValidation.validate(req.body);
    if (result.error){
      throw new ExpressError(400,result.error);
    }
    else{
      next();
    }
  }


  module.exports.isReviewAuthor = async(req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);  
    if(!review.author._id.equals(res.locals.currUser._id)){
      req.flash('error','You cannot make changes!');
      return res.redirect(`/listing/${id}`);
    }
    next();
};