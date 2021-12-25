const bcrypt = require('bcrypt')
let config = require('./config.json')

module.exports = {
  generateHash,
  compareHash,
  isEmpty,
  expiresAt
}

function generateHash (plainText) {
  return bcrypt.hashSync(plainText, config.saltRounds)
}

function compareHash (plainText, hashString) {
  return bcrypt.compareSync(plainText, hashString)
}

function isEmpty (obj) {
  if (obj === undefined || obj === null || obj === '') { return true }

  if (typeof obj === 'number' || typeof obj === 'string') { return false }
  if (obj.length > 0) { return false }
  if (obj.length <= 0) { return true }

  for (let key in obj) {
    if (hasOwnProperty.call(obj, key)) { return false }
  }
  return true
}

function expiresAt (seconds) {
  let date = new Date()
  date.setSeconds(date.getSeconds() + seconds)
  return date.getTime()
}
