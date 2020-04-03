const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PrivacySchema = new Schema({
  text: {
    type: String,
    required: [true, 'Privacy text is required']
  }
})

const Privacy = mongoose.model('privacy', PrivacySchema)
module.exports = Privacy
