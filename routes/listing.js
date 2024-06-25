const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const { isLoggedIn, isOwner, validateListing } = require('../middleware');
const wrapAsync = require('../utils/wrapAsync');

// All Listings - Show route
router.get('', wrapAsync(async (req, res) => {
  let allListing = await Listing.find().populate('owner');
  res.render('listing/index.ejs', { allListing });
}));

// Root route
router.get("/", wrapAsync(async (req, res) => {
  let allListing = await Listing.find().populate('owner');
  res.render('listing/index.ejs', { allListing });
}));

// Form to add new - Create route
router.get('/new', isLoggedIn, (req, res) => {
  res.render('listing/new.ejs');
});

router.post('', isLoggedIn, validateListing, wrapAsync(async (req, res) => {
  let newData = new Listing({ ...req.body, owner: req.user._id });
  await newData.save();
  req.flash("success", "New Listing Added");
  res.redirect('');
}));

// Show specific listing
router.get('/:id', wrapAsync(async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate('owner')
    .populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    });
  if (!listing) {
    req.flash("error", "The page doesn't exist");
    res.redirect("/");
  }
  res.render('listing/show.ejs', { listing });
}));

// Edit listing
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/");
  }
  res.render('listing/edit.ejs', { listing });
}));

router.put('/:id', isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body });
  res.redirect('');
}));

// Delete listing
router.get('/:id/delete', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Deleted successfully");
  res.redirect('');
}));

module.exports = router;
