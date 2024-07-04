const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  username: String,
  rating: Number,
  comment: String,
  date: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
