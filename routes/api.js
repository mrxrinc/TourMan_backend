const express = require('express')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const jalaali = require('jalaali-js')
const User = require('../models/user')
const SECRET_KEY = require('../assets/secretKey')
const router = express.Router()
const Privacy = require('../models/privacy')
const Help = require('../models/help')
const Feedback = require('../models/feedback')
const ReportUser = require('../models/reportUser')
const Home = require('../models/home')
const Review = require('../models/review')
const Reserve = require('../models/reserve')
const General = require('../models/general')
const baseURL = 'http://localhost:3000/'  // Change this before the production

let persianDate = jalaali.toJalaali(new Date())
persianDate = `${persianDate.jy}/${persianDate.jm}/${persianDate.jd}`

function validateUser(req, res, next) {
  const bearerHeader = req.headers['authorization']
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')
    const bearerToken = bearer[1]
    req.token = bearerToken
    next()
  } else {
    res.sendStatus(403)
  }
}

function calculateReviews(reviews) {
  const rateArray = []
  let reviewsCount = 0
  for (const item in reviews) {
    rateArray.push(reviews[item].rate)
    reviewsCount++
  }
  const ratingSum = rateArray.reduce((total, val) => total + val)
  const overallRate = ratingSum / rateArray.length
  return {
    reviewsCount,
    overallRate
  }
}

router.get('/users/:id', validateUser,(req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      // everytime getting a user, it needs to calculate the reviews information
      Review.find({ parent: req.params.id })
        .then(reviews => {
          if (reviews.length) { // if user has Reviews
            const userNewData = calculateReviews(reviews)
            User.findByIdAndUpdate({ _id: req.params.id }, userNewData)
              .then(() => {
                User.findOne({ _id: req.params.id })
                  .then(data => {                  
                    res.send(data)
                  })
              })
          } else { // if user has'nt any Reviews
            const resetReviewInfo = {
              reviewsCount: 0,
              overallRate: 0
            }
            User.findByIdAndUpdate({ _id: req.params.id }, resetReviewInfo)
            .then(() => {
              User.findOne({ _id: req.params.id })
              .then(data => {  
                res.send(data)
              })
            })
          }
        })
    }
  })
})

router.post('/users/signup', (req, res, next) => {
  const tokenData = {
    firstName: req.body.firstName.trim(),
    lastName: req.body.lastName.trim(),
    email: req.body.email.trim().toLowerCase(),
  }
  const token = jwt.sign({ tokenData }, SECRET_KEY)
  req.body.token = token
  const safeInputData = {
    ...req.body,
    firstName: req.body.firstName.trim(),
    lastName: req.body.lastName.trim(),
    password: req.body.password.trim(),
    email: req.body.email.trim().toLowerCase(),
    avatar: `${baseURL}uploads/userAvatars/default_profile_photo.png`,
    registerDate: persianDate
  }
  User.find({ email: safeInputData.email })
  .then((result) => {
    if (result.length) {
      res.json({ userState: 'duplicate' })
    } else {
      console.log(safeInputData)      
      User.create(safeInputData)
      .then((user) => {       
        console.log('================')  
        res.send(user)
      })
    }
  })
  .catch(err => console.log(err))
})

router.post('/users/signin', (req, res) => {
  const email = req.body.email.trim().toLowerCase()
  const password = req.body.password.trim()
  User.find({ email, password })
  .then((user) => {
    if (user.length) {  
      res.json(user[0]) 
    } else {
      res.json({ userState: 'noUser' })
    }
  })
  .catch(() => console.log('Mongo connection Error'))
})

router.put('/users/update/:id', validateUser,(req, res, next) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      User.findByIdAndUpdate({ _id: req.params.id }, req.body)
      .then(() => {
        User.findOne({_id: req.params.id})
        .then(user => {
          res.send(user)
        })
      })
      .catch(err => console.log(err))
    }
  })
})

router.put('/users/message/:id', validateUser, (req, res, next) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      const data = {
        ...req.body,
        date: persianDate
      }
      User.findOne({ _id: req.params.id })
        .then(user => {   
          const msgs = user.messages    
          msgs.push(data)
          User.findByIdAndUpdate({ _id: req.params.id }, { messages: msgs })
            .then(() => {
              User.findOne({ _id: req.params.id })
                .then(user => {
                  res.send(user.messages)
                })
            })
        })
        .catch(err => console.log(err))
    }
  })
})

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/userAvatars')
  },
  filename: (req, file, cb) => {
    const randomString = Math.random().toString(36).substring(2)
    cb(null, Date.now() + randomString + path.extname(file.originalname))
  }
})
const userFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb('ERROR : NOT Allowed FORMAT')
  }
}
var userAvatarUpload = multer({
  storage: userStorage,
  limits: { fileSize: 1024 * 1024 * 6 },
  fileFilter: userFileFilter
}).single('userAvatar')

router.post('/users/avatar', validateUser, (req, res, next) => {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  userAvatarUpload(req, res, (err) => {
    if (err) {
      res.send(err)
    } else {
      const avatarPath = baseURL + req.file.path.replace(/\\/g, '/')
      res.send(avatarPath)
    }
  })
})

router.get('/privacy', (req, res) => {
  Privacy.find({})
    .then(data => {
      res.send(data)
    })
})

router.post('/privacy', validateUser, (req, res) => {
  console.log('REQ BODY ===> ', req.body);
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      Privacy.create(req.body)
        .then((data) => {
          res.send(data)
        })
        .catch(() => console.log('Error in creating Privacy item'))
    }
  })
})

router.get('/help', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      Help.find({})
        .then(data => {
          res.send(data)
        })
    }
  })
})

router.post('/feedback', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      User.findOne({ _id: req.body.userId })
        .then(user => {
          const data = {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            mobile: user.mobile,
            date: persianDate,
            ...req.body
          }
          Feedback.create(data)
            .then((feedbackRes) => {
              res.send(feedbackRes)
            })
            .catch((err) => console.log(err))
        })
    }
  })
})

router.post('/reportUser', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      ReportUser.create(req.body)
        .then((result) => {
          res.send(result)
        })
        .catch((err) => console.log(err))
    }
  })
})

router.get('/homes', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      console.log('Query: ', req.query)
      const q = req.query
      // console.log('PRICE ====> ', q.price[1])      
      let payload = {}
      if (Object.keys(q).length !== 0) { // we have Filter properties
        const keys = Object.keys(q)
        keys.forEach((item) => {
          switch (item) {
            case 'host': 
              q.host !== null ? payload = { ...payload, 'host.id': q.host } : null; break
            case 'province':
              q.province !== 'all' ? payload = { ...payload, province: q.province } : null; break
            case 'rooms':
              q.rooms !== '1' ? payload = { ...payload, rooms: q.rooms } : null; break
            case 'beds':
              q.beds !== '1' ? payload = { ...payload, beds: q.beds } : null; break
            case 'bathrooms':
              q.bathrooms !== '1' ? payload = { ...payload, bathrooms: q.bathrooms } : null; break
            case 'adults':
              q.adults !== '1' ? payload = { ...payload, 'capacity.adults': { $gte: q.adults } } : null; break
            case 'children':
              q.children !== '0' ? payload = { ...payload, 'capacity.children': { $gte: q.children } } : null; break
            case 'instanceReserve':
              q.instanceReserve !== 'false' ? payload = { ...payload, instanceReserve: q.instanceReserve } : null; break
            case 'entire':
              q.entire !== 'false' ? payload = { ...payload, 'homeType.entire': q.entire } : null; break
            case 'privateRoom':
              q.privateRoom !== 'false' ? payload = { ...payload, 'homeType.privateRoom': q.privateRoom } : null; break
            case 'sharedRoom':
              q.sharedRoom !== 'false' ? payload = { ...payload, 'homeType.sharedRoom': q.sharedRoom } : null; break
            case 'luxury':
              q.luxury !== 'false' ? payload = { ...payload, luxury: q.luxury } : null; break
            case 'wifi':
              q.wifi !== 'false' ? payload = { ...payload, 'amenities.wifi': q.wifi } : null; break
            case 'tv':
              q.tv !== 'false' ? payload = { ...payload, 'amenities.tv': q.tv } : null; break
            case 'accessories':
              q.accessories !== 'false' ? payload = { ...payload, 'amenities.accessories': q.accessories } : null; break
            case 'kitchen':
              q.kitchen !== 'false' ? payload = { ...payload, 'amenities.kitchen': q.kitchen } : null; break
            case 'washingMachine':
              q.washingMachine !== 'false' ? payload = { ...payload, 'amenities.washingMachine': q.washingMachine } : null; break
            case 'cooler':
              q.cooler !== 'false' ? payload = { ...payload, 'amenities.cooler': q.cooler } : null; break
            case 'parkingLot':
              q.parkingLot !== 'false' ? payload = { ...payload, 'amenities.parkingLot': q.parkingLot } : null; break
            case 'celebrationAllowed':
              q.celebrationAllowed !== 'false' ? payload = { ...payload, 'homeRules.celebrationAllowed': q.celebrationAllowed } : null; break
            case 'smokingAllowed':
              q.smokingAllowed !== 'false' ? payload = { ...payload, 'homeRules.smokingAllowed': q.smokingAllowed } : null; break
            case 'petsAllowed':
              q.petsAllowed !== 'false' ? payload = { ...payload, 'homeRules.petsAllowed': q.petsAllowed } : null; break
            case 'popular':
              q.popular !== 'false' ? payload = { ...payload, popular: q.popular } : null; break
            case 'not':
              payload = { ...payload, _id: { $ne: q.not } }; break
            case 'price':
              q.price !== ['10', '1000'] ? payload = { ...payload, $and: [{ price: { $gte: q.price[0] } }, { price: { $lte: q.price[1] } }] } : null; break
            default:
              payload = { ...payload }
          }
        })
      }
      console.log('payload ==> ', payload)
      Home.find(payload).sort({ _id: -1 })
        .then(data => {
          console.log(res.data)
          res.send(data)
        })
        .catch(err => console.log(err))
    }
  })
})

router.post('/homes', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      Home.create(req.body)
        .then((result) => {
          res.send(result)
        })
        .catch((err) => res.send(err))
    }
  })
})

router.put('/homes/:id', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      Home.findByIdAndUpdate({ _id: req.params.id }, { ...req.body })
        .then(() => {
          Home.findOne({ _id: req.params.id })
            .then(home => {
              res.send(home)
            })
        })
        .catch(err => console.log(err))
    }
  })
})

router.delete('/homes', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      // res.send(req.query.id)
      Home.deleteOne({ _id: req.query.id })
        .then((result) => {
          res.send(result)
        })
        .catch((err) => res.send(err))
    }
  })
})

router.get('/homes/:id', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      // everytime getting a user, it needs to calculate the reviews information
      Review.find({ parent: req.params.id })
        .then(reviews => {
          if (reviews.length) { // if home has Reviews
            const homeNewData = calculateReviews(reviews)
            Home.findByIdAndUpdate({ _id: req.params.id }, homeNewData)
              .then(() => {
                Home.findOne({ _id: req.params.id })
                  .then(data => {
                    res.send(data)
                  })
              })
          } else { // if home has'nt any Reviews
            const resetReviewInfo = {
              reviewsCount: 0,
              overallRate: 0
            }
            Home.findByIdAndUpdate({ _id: req.params.id }, resetReviewInfo)
              .then(() => {
                Home.findOne({ _id: req.params.id })
                  .then(data => {
                    res.send(data)
                  })
              })
          }
        })

    }
  })
})

router.get('/homes/getInArray/:array', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      console.log(req.params.array);
      const array = req.params.array.split(',')
      Home.find({ _id: { $in: array } }).sort({ _id: -1 })
        .then(data => {
          res.send(data)
        })
        .catch(err => console.log(err))
    }
  })
})

router.post('/reviews', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      const data = {
        ...req.body,
        date: persianDate
      }
      Review.create(data)
        .then((result) => {
          res.send(result)
        })
        .catch((err) => res.send(err))
    }
  })
})

router.get('/reviews/:id', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      Review.find({ parent: req.params.id }).sort({ _id: -1 })
        .then(data => {
          res.send(data)
        })
        .catch(err => console.log(err))
    }
  })
})

const homeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/homeImages')
  },
  filename: (req, file, cb) => {
    const randomString = Math.random().toString(36).substring(2)
    cb(null, Date.now() + randomString + path.extname(file.originalname))
  }
})
const homeFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb('ERROR : NOT Allowed FORMAT')
  }
}
var homeAvatarUpload = multer({
  storage: homeStorage,
  limits: { fileSize: 1024 * 1024 * 3 }, // means 3MB
  fileFilter: homeFileFilter
}).single('homeImage')

router.post('/homes/image', validateUser, (req, res, next) => {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  homeAvatarUpload(req, res, (err) => {
    if (err) {
      res.send(err)
    } else {
      const avatarPath = baseURL + req.file.path.replace(/\\/g, '/')
      res.send(avatarPath)
    }
  })
})

router.post('/reserve', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      Reserve.create(req.body)
        .then((data) => {
          console.log(data)
          // find the guest
          User.findOne({ _id: data.guestId })
            .then(user => {
              //add this trip to his trips array
              const trips = user.trips
              trips.push(data.homeId)
              User.findByIdAndUpdate({ _id: data.guestId }, { trips })
                .then(() => {
                  // then find the home that was reserved
                  Home.findOne({ _id: data.homeId })
                    .then(home => {
                      // now add reserved days to it's array
                      const oldResDays = home.reservedDays
                      const newResDays = data.reservedDays
                      oldResDays.forEach(element => {
                        newResDays.push(element)
                      })
                      Home.findByIdAndUpdate({ _id: data.homeId }, { 
                        reservedDays: newResDays 
                      })
                        .then(updatedHome => {
                          // sending the reserve details
                          res.send(data)
                        })
                    })
                })
            })
            .catch(err => console.log(err))
        })
        .catch(() => console.log('Error in creating Reserve item'))
    }
  })
})

router.get('/reserve/:host', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      Reserve.find({ hostId: req.params.host }).sort({ _id: -1 })
        .then(data => {         
          res.send(data)
        })
        .catch(err => console.log(err))
    }
  })
})

router.get('/reserve/duplicateCheck/:guest/:home', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      Reserve.find({ guestId: req.params.guest, homeId: req.params.home })
        .then(data => {
          console.log('we got the duplicate!', data)          
          res.send(data)
        })
        .catch(err => console.log(err))
    }
  })
})

router.delete('/reserve', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      Reserve.find({ _id: req.query.id})
        .then(reserve => {
          Reserve.deleteOne({ _id: req.query.id })
            .then((deleteRes) => {
              console.log(deleteRes)
              if (deleteRes.n === 1) {
                User.find({ _id: reserve[0].guestId })
                  .then(user => {
                    if (user.length) { // we have users
                      const trips = user[0].trips
                      const uIndex = trips.indexOf(reserve[0].homeId)
                      if (uIndex > -1) {
                        trips.splice(uIndex, 1)
                        User.findByIdAndUpdate({ _id: user[0]._id }, { trips })
                          .then(() => {
                            console.log('user Updated!')
                          })
                      }
                    }
                  }).catch(err => console.log('err on find guest', err))
                Home.find({ _id: reserve[0].homeId })
                  .then(home => {
                    if (home.length) { // if can get any home
                      const reservedDays = home[0].reservedDays
                      const removingDays = reserve[0].reservedDays
                      //coz in js two ame arrays arenot equal! then we need to convert them
                      //to strings to be able to use the indexOf shit!
                      const strReserved = []
                      const strRemoving = []
                      reservedDays.forEach(element => {
                        strReserved.push(element.toString())
                      })
                      removingDays.forEach(element => {
                        strRemoving.push(element.toString())
                      })
                      
                      strRemoving.forEach(element => {
                        const hIndex = strReserved.indexOf(element)
                        if (hIndex > -1) {
                          // replascing all matchings with null, coz we need to keep array length
                          reservedDays.splice(hIndex, 1, null)
                        }
                      })
                      const newReservedDays = reservedDays.filter(e => e) // filtering all nulls
                      console.log('NEW_RESERVED_DAYS: ', newReservedDays)
                      Home.findByIdAndUpdate({ _id: reserve[0].homeId }, { reservedDays: newReservedDays })
                        .then(() => {
                          console.log('home Updated too!')
                        })
                    }
                  }).catch(err => console.log('err on home update', err))
                  res.send(deleteRes) // sending the result to app
              }
            })
            .catch((err) => res.send('err on reserve delete!', err))
          //
          
        }).catch(err => console.log('find reserve item error', err))
      
    }
  })
})

router.get('/explore', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      General.find({})
        .then(data => {
          res.send(data)
        })
        .catch(err => console.log(err))
    }
  })
})

router.post('/explore', validateUser, (req, res) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      General.create(req.body)
        .then(data => {          
          res.send(data)
        })
    }
  })
})

router.put('/explore/:id', validateUser, (req, res, next) => {
  jwt.verify(req.token, SECRET_KEY, (err, data) => {
    if (err) {
      res.sendStatus(403)
    } else {
      General.findByIdAndUpdate({ _id: req.params.id }, req.body)
        .then(() => {
          General.findOne({ _id: req.params.id })
            .then(data => {
              res.send(data)
            })
        })
        .catch(err => console.log(err))
    }
  })
})



module.exports = router
