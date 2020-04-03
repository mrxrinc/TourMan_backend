const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HomeSchema = new Schema({
  title: String,
  images: [String],
  host: {
    id: String,
    fullName: String,
    avatar: String,
    verified: Boolean
  },
  homeType: {
    entire: { type: Boolean, default: true },
    privateRoom: { type: Boolean, default: false },
    sharedRoom: { type: Boolean, default: false }
  },
  capacity: { 
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
  },
  rooms: { type: Number, default: 1 },
  beds: { type: Number, default: 1 },
  bathrooms: { type: Number, default: 1 },
  about: {
    details: String,
    guestAccessibility: String,
    neighborhood: String,
    accessToCityGoods: String
  },
  price: Number,
  minimumNights: { type: Number, default: 1 },
  amenities: {
    wifi: { type: Boolean, default: false },
    heat: { type: Boolean, default: false },
    washingMachine: { type: Boolean, default: false },
    fireplace: { type: Boolean, default: false },
    iron: { type: Boolean, default: false },
    laptopFriendly: { type: Boolean, default: false },
    accessories: { type: Boolean, default: false },
    cooler: { type: Boolean, default: false },
    tv: { type: Boolean, default: false },
    parkingLot: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    hairDryer: { type: Boolean, default: false },
    firstAids: { type: Boolean, default: false },
    smokeDetector:{ type: Boolean, default: false }
  },
  location: {
    latitude: Number,
    longitude:Number,
    latitudeDelta:Number,
    longitudeDelta: Number
  },
  province: String,
  visitHours: [Number, Number],
  homeRules: {
    celebrationAllowed: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    description: String
  },
  cancelation: { type: Number, default: 1 },
  instanceReserve: { type: Boolean, default: false },
  reservedDays: [Array],
  overallRate: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  luxury: { type: Boolean, default: false },
  popular: { type: Boolean, default: false }
})

const Home = mongoose.model('home', HomeSchema)
module.exports = Home
