const mongoose = require('mongoose');

const patisserieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: Number, required: true },
  order: { type: Number, required: true },
});

const Patisserie = mongoose.model('Patisserie', patisserieSchema);

module.exports = Patisserie;
