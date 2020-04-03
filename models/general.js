const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GeneralSchema = new Schema({
  specialOffers: [String],
  promotedCities: [
    {
      name: String,
      image: String,
      province: String
    }
  ]
})

const General = mongoose.model('general', GeneralSchema)
module.exports = General
