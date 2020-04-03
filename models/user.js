const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'FirstName is required']
  },
  lastName: {
    type: String,
    required: [true, 'LastName is required']
  }, 
  email: {
    type: String,
    required: [true, 'Email is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  birthday: {
    type: Array
  },
  mobile: {
    type: String
  },
  sex: {
    type: String,
    default: 'male'
  },
  location: {
    type: String
  },
  avatar: {
    type: String,
  },
  thumb: {
    type: String
  },
  about: {
    type: String
  },
  job: {
    type: String
  },
  education: {
    type: String
  },
  languages: {
    type: Array,
    default: ['FA']
  },
  verifiedInfo: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  token: {
    type: String
  },
  registerDate: {
    type: String,
  },
  reviewsCount: Number,
  overallRate: Number,
  likes: [String],
  trips: [String],
  messages: [
    {
      title: String,
      text: String,
      date: String,
      archive: Boolean
    }
  ]
})

const User = mongoose.model('user', UserSchema)
module.exports = User
