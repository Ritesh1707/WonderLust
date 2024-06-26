const express = require('express');
const router = express.Router({mergeParams : true});
const Listing = require('../models/listing');
const Review = require('../models/reviews');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');
const wrapAsync = require('../utils/wrapAsync');
const reviewsControllers = require('../controllers/reviewsControllers')

// Post reviews route
router.post('/reviews', isLoggedIn, validateReview, wrapAsync(reviewsControllers.createReview));

// Delete review route
router.delete('/reviews/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewsControllers.destroyReview));

module.exports = router;