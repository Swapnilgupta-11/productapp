let express = require('express')
let router = express.Router()

let userModel = require('./userModel')

router.post('/signin', loginUser)
module.exports = router

function loginUser (request, response) {
  var data = request.body

  if (!data.email || !data.password) {
    response.json({status: 'error', message: 'Email and password are mandatory fields.'})
  }

  userModel.mValidateUser(data, function (err, result, customErr) {
    if (err) {
      return response.json({status: 'error', message: err.message})
    } else if (customErr) {
      return response.json({status: 'error', message: customErr.message})
    } else {
      return response.json({status: 'success', data: result})
    }
  })
}
