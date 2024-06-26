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
  res.render('listing/edit.ejs', { listing });
};
 
 
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body });
  res.redirect('');
};
 
 
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Deleted successfully");
  res.redirect('/listings');
}; 