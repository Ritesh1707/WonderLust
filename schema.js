const Joi = require("joi");
module.exports.listingValidation = Joi.object({
  // listing : Joi.object().required(),  In case if we take data in object from Html web page
  title: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.object().allow("", null),
  price: Joi.number().required().min(0),
  location: Joi.string().required(),
  country: Joi.string().required(),
}).required();

module.exports.reviewValidation = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).integer().required(),
    comment: Joi.string().required(),
  }).required()
});


