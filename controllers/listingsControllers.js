const Listing =  require('../models/listing')

module.exports.index = async (req, res) => {
    let allListing = await Listing.find().populate('owner');
    res.render('listing/index.ejs', { allListing });
  };
 
 
module.exports.renderNewForm =(req, res) => {
  res.render('listing/new.ejs');
} ;
 
module.exports.createListing = async (req, res) => {
  let newData = new Listing({ ...req.body, owner: req.user._id });
  newData.image.url = req.file.path;  //Accessing it by multer
  await newData.save();
  req.flash('success', 'Successfully made a new listing!');
  await newData.save();
  req.flash("success", "New Listing Added");
  res.redirect('/listings');
};
 
 
module.exports.showListing = async (req, res) => {
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
};
 
 
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/");
  }
  let compressedUrl = listing.image.url.replace('/upload' ,'/upload/h_250');
  res.render('listing/edit.ejs', { listing, compressedUrl});
};
 
 
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body });
  if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save()
  }
  res.redirect('/listings');
};
 
 
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Deleted successfully");
  res.redirect('/listings');
}; 