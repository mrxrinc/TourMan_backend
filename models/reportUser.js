const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReportUserSchema = new Schema({
  userId: String,
  hostId: String,
  reportType: Number
})

const ReportUser = mongoose.model('reportUser', ReportUserSchema)
module.exports = ReportUser
