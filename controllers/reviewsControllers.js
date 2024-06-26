const Listing = require('../models/listing');
const Review = require('../models/reviews');

module.exports.createReview = async (req, res) => {
    let list = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    list.reviews.push(newReview);
    await newReview.save();
    await list.save();
    res.redirect(`/listings/${req.params.id}`);
  };

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    res.redirect(`/listings/${id}`);
  };
