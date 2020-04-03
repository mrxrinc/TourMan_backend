const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReserveSchema = new Schema({
  homeId: String,
  homeTitle: String,
  hostId: String,
  hostName: String,
  guestId: String,
  guestName: String,
  adults: Number,
  children: Number,
  pets: Boolean,
  reservedDays: [Array],
  price: Number,
  totalNights: Number,
  totalPrice: Number,
  reservedDate: String,
  message: String
})

const Reserve = mongoose.model('reserve', ReserveSchema)
module.exports = Reserve
