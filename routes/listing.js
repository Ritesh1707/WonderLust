const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const listingsControllers = require("../controllers/listingsControllers");


router.route('/')
  .get(wrapAsync(listingsControllers.index))  //showing all list
  .post(isLoggedIn, validateListing, wrapAsync(listingsControllers.createListing))  //creating listing
  
// Form to add new - Create route
router.get("/new", isLoggedIn, listingsControllers.renderNewForm);


router.route("/:id",)
.get( wrapAsync(listingsControllers.showListing)) // Show specific listing
.put( isLoggedIn, isOwner, validateListing, wrapAsync(listingsControllers.updateListing)  //edit listing
);

// Edit listing
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsControllers.renderEditForm)
);


// Delete listing
router.get(
  "/:id/delete",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsControllers.destroyListing)
);

module.exports = router;