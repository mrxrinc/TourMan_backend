const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()

mongoose.connect('mongodb://localhost/tourmandb')
mongoose.Promise = global.Promise

app.use('/uploads', express.static('uploads')) // access permision
app.use(bodyParser.json())
app.use('/api', require('./routes/api'))

app.use((err, req, res, next) => {
  res.status(422).send({error: err._message})
})

app.listen(3000, () => {
  console.log('SERVER IS READY!')
})
