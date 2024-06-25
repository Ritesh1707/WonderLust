const express = require('express');
const router = express.Router({mergeParams : true});
const Listing = require('../models/listing');
const Review = require('../models/reviews');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');
const wrapAsync = require('../utils/wrapAsync');

// Post reviews route
router.post('/reviews', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
  let list = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  list.reviews.push(newReview);
  await newReview.save();
  await list.save();
  res.redirect(`/listings/${req.params.id}`);
}));

// Delete review route
router.delete('/reviews/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Review.findByIdAndDelete(reviewId);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  res.redirect(`/listings/${id}`);
}));

module.exports = router;