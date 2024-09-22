const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// const { parse } = require('dotenv');

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
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'confirm password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'password are not the same',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimeStamp < changedTimestamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
