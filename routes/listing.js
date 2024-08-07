const express = require("express");
const router = express.Router();
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const listingsControllers = require("../controllers/listingsControllers");
const multer = require('multer')
const {storage} = require('../cloudConfig.js')
const upload = multer({storage})


router.route('/')
  .get(wrapAsync(listingsControllers.index))  //showing all list
  .post(isLoggedIn, upload.single('image[url]'), validateListing, wrapAsync(listingsControllers.createListing))  //creating listing
  .post(upload.single('image[url]'), async(req,res)=>{ res.send(req.file);
  })  //creating listing
  
// Form to add new - Create route
router.get("/new", isLoggedIn, listingsControllers.renderNewForm);


router.route("/:id",)
.get( wrapAsync(listingsControllers.showListing)) // Show specific listing
.put( isLoggedIn, isOwner, upload.single('image[url]'), validateListing, wrapAsync(listingsControllers.updateListing)  //edit or update listing
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