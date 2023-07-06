const mongoose = require('mongoose');

const patisserieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  number: {
    type: Number,
    required: true,
    default: 10,  
  }, 
});

patisserieSchema.statics.findRandom = function(count) {
  return this.aggregate([{ $sample: { size: count } }]);
};

const Patisserie = mongoose.model('Patisserie', patisserieSchema);

module.exports = Patisserie;
