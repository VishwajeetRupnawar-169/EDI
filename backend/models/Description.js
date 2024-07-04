const mongoose = require('mongoose');

const descriptionSchema = new mongoose.Schema({
  content: String
});

const Description = mongoose.model('Description', descriptionSchema);

module.exports = Description;
