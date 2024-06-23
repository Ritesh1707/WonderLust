const {User} = require('../models/user.js')
const mongoose = require("mongoose");
const reviewsSchema = new mongoose.Schema({
    comment : String,
    rating: {
        type : Number,
        min:1,
        max:5
    },
    createdAt:{
        type: Date,
        default :Date.now()
    },
    author: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
})

const Review = mongoose.model("Review",reviewsSchema);
module.exports = Review;