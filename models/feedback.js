const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FeedbackSchema = new Schema({
  userId: {
    type: String,
    required: [true, 'userId is required']
  },
  date: String,
  text: String,
  name: String,
  email: String,
  mobile: String
})

const Feedback = mongoose.model('feedback', FeedbackSchema)
module.exports = Feedback
