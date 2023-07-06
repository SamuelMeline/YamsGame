const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  patisseries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patisserie' }],
  lastPlayed: {
    type: Date,
    default: null},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
