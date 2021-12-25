let express = require('express')
let router = express.Router()
let {Job} = require('../models')
let path = require('path')
let uploadPath = 'uploads'
let fs = require('fs')
let auth = require('../user/auth')

const mailer = require('../mailer')

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/../' + uploadPath)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

/* GET ALL JOBS */
router.get('/', function (req, res, next) {
  let user = auth.getUser(req);
  Job.findAll({where: {userId: user.id}}).then(jobs => {
    res.json(jobs)
  }).catch(err => {
    return next(err)
  })
})

router.get('/search/:query', function (req, res, next) {
  console.log('req.params.query', req.params.query)

  let searchCriteria = [ {cust_name: {'$regex': req.params.query, '$options': 'i'}}, {cust_mobile: {'$regex': req.params.query, '$options': 'i'}}, {cust_email: {'$regex': req.params.query, '$options': 'i'}} ]

  if (parseFloat(req.params.query)) searchCriteria.push({prod_price: parseFloat(req.params.query)})
  // if(mongoose.Types.isValid(req.params.query)) searchCriteria.push({_id: new ObjectId(req.params.query)})
  // console.log('searchCriteria', JSON.stringify(searchCriteria))
  Job.find({ $or: searchCriteria }, function (err, products) {
    if (err) return next(err)
    res.json(products)
  })
})

/* GET SINGLE JOB BY ID */
router.get('/:id', function (req, res, next) {
  Job.findByPk(req.params.id).then(post => {
    if (!post) return res.json({status: 'error', message: 'Requested job not found'})

    return res.json(post)
  }).catch(err => {
    return next(err)
  })
})

function padLeft(number, length, str = '0'){
  return Array(length-String(number).length+1).join(str) + number;
}

function generateJobNumber(jobNumber) {
  if(!jobNumber) return 'CASE00001'
  let t = jobNumber.substr(4)
  let m = parseInt(t)
  m++
  return 'CASE' + padLeft(m, t.length)
}

/* SAVE JOB */
router.post('/', upload.single('invoice'), async function (req, res, next) {
  let user = auth.getUser(req);
  let invoicePath = null
  if(req.file) {
    console.log("received file", req.file)
    invoicePath = uploadPath + '/' + req.file.filename
  }

  let result = await Job.findOne({order: [['jobNumber', 'desc']], attributes: ['jobNumber']});

  req.body.jobNumber = generateJobNumber(result && result.jobNumber ? result.jobNumber : null)
  // req.body.problems = req.body.problems ? JSON.parse(req.body.problems).join('#') : null
  req.body.invoicePath = invoicePath
  req.body.userId = user.id

  Job.create(req.body).then(post => {
    generateEmailTemplate(post);
    res.json({status: 'success', data: { jobNumber: post.jobNumber, id: post.id }})
  }).catch(err => {
    return next(err)
  })
})

/* UPDATE JOB */
router.put('/:id', upload.single('invoice'), async function (req, res, next) {
  let invoicePath = null

  // console.log('received res', req.body, JSON.parse(req.body.problems))
  // return res.send((req.body))

  // req.body.problems = req.body.problems ? JSON.parse(req.body.problems) : null
  // req.body.problems = req.body.problems.join('#')
  if(req.file) {
    var filePath = '';
    let jobResult = await Job.findByPk(req.params.id)
    if(jobResult.invoicePath) {
      fs.unlinkSync(path.resolve(__dirname + '/../' + jobResult.invoicePath), err => {
        if(err) {
          console.log('File can not be deleted', err)
          return res.json({status: 'error', message: 'Job update failed'})
        }
      });
    }

    invoicePath = uploadPath + '/' + req.file.filename
  }

  req.body.invoicePath = invoicePath

  Job.update(req.body, {where: {id: req.params.id}}).then(post => {
    // console.log('post', post)
    if (post[0]) return res.json({status: 'success'})
    else return res.json({status: 'error', message: 'Job update failed'})
  }).catch(err => {
    return next(err)
  })
})

/* DELETE JOB */
router.delete('/:id', function (req, res, next) {
  Job.destroy({where: {id: req.params.id}}).then(post => {
    if (post) return res.json({status: 'success'})
    else return res.json({status: 'error', message: 'Job delete failed'})
  }).catch(err => {
    return next(err)
  })
})

function generateEmailTemplate (details) {
  let html = `<h2>Customer Details</h2>`
  html += `<p><b>Name:</b> ${details.name}</p>`
  html += `<p><b>Email:</b> ${details.email}</p>`
  html += `<p><b>Mobile Number:</b> ${details.mobileNumber}</p>`
  html += `<p><b>Address:</b> ${details.address}</p>`
  html += `<p><b>Landmark:</b> ${details.landmark}</p>`
  html += `<p><b>Postal Code:</b> ${details.postalCode}</p>`
  html += `<h2>Product Details</h2>`
  html += `<p><b>Product Name:</b> ${details.productName}</p>`
  html += `<p><b>Purchase Date:</b> ${details.purchaseDate}</p>`
  html += `<p><b>Request Created On:</b> ${details.createdAt}</p>`
  html += `<p><b>Product Name:</b> ${details.productName}</p>`
  html += `<p><b>Problems:</b> ${details.problems}</p>`

  mailer.sendMail(details.email, 'Your job requst is created Successfully', html)
}

module.exports = router
