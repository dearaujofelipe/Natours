const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user needs name'],
  },
  email: {
    type: String,
    required: [true, 'user needs email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'provide a password'],
    minLenght: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'confirme password'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
