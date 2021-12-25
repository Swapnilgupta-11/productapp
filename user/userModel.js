let auth = require('./auth')

let User = require('../models').User
let util = require('./util')
let userModel = {
  'mValidateUser': mValidateUser
}

function mValidateUser (data, callback) {
  console.log('User:: inside mValidateUser')

  User.findOne({ where: {email: data.email} }).then(result => {

    if (result) {
      console.log('encoded password', util.generateHash(data.password))
      console.log('result', result.get({plain: true}))
      console.log('User:: got the user', result.password, data.password)

      if (util.compareHash(data.password, result.password)) {
        let user = {id: result.id, name: result.name, email: result.email, role: result.roleid, mobile_number: result.mobile_number}
        let newToken = auth.generateToken(user)
        console.log('User:: authentication successfull - token: ' + newToken)
        callback(null, {token: newToken, user: user}, null)
      } else {
        console.log('User:: authentication failed due to wrong password')
        callback(null, null, new Error('Invalid password, Please try again!'))
      }
    } else {
      console.log('User:: authentication failed due to wrong email')
      callback(null, null, new Error('Invalid email, Please try again!'))
    }
  }).catch(err => {
    console.log('User:: Error in fetching the user details', err)
    callback(err, null)
  })
}

module.exports = userModel
