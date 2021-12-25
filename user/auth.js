var jwt = require('jwt-simple')
let config = require('./config.json')
let util = require('./util')

var auth = {}

function authenticate (request, response, next) {
  if (request.method === 'OPTIONS') {
    console.debug('Auth options')
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS DELETE')
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    response.setHeader('access-control-expose-headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    next()
  } else {
    console.debug('Auth Started')
    // Write your authentication logic here
    try {
      var token = request.headers['authorization'] || null
      if (token) {
        var decoded = jwt.decode(token, config.secretKey)
        // console.debug("decoded msg::", JSON.stringify(decoded));
        if (decoded.expire_at <= Date.now()) {
          console.debug('Token Force Expire done, expire_at:', decoded.expire_at)

          return response.json({status: 'error', message: 'Access token is expired.'})
        } else {
          var inactiveTime = 0
          if (decoded.last_modified < Date.now()) {
            inactiveTime = Math.abs((Date.now() - decoded.last_modified) / 60000)
          }
          if (inactiveTime >= config.inactiveTimeFrame) {
            console.debug('Token Expire due to inactive')
            return response.json({status: 'error', message: 'Access token is expired.'})
          } else {
            console.debug('Token authorized')
            request.decoded = decoded
            var newToken = generateToken(decoded.payload, decoded.expire_at)
            response.setHeader('Authorization', newToken)
            return next()
          }
        }
      } else {
        console.debug('Token is missing in request')
        return response.json({status: 'error', message: 'Access token is expired.'})
      }
    } catch (e) {
      console.error('Error generating auth token, ', e)
      return response.json({status: 'error', message: 'Unauthorized access'})
    }
  }
};
auth.authenticate = authenticate

function generateToken (payload, expireAt) {
  var lastModified = Date.now()
  if (util.isEmpty(expireAt)) {
    var time = 60 * 60
    if (config.forceExpireTimeFrame && typeof config.forceExpireTimeFrame === 'number') {
      time = config.forceExpireTimeFrame * 60
      console.debug('Force expire time frame set.', config.forceExpireTimeFrame)
    } else { console.debug('Default 60min force expire time frame set.') }
    expireAt = util.expiresAt(time)
  }
  var token = jwt.encode({
    last_modified: lastModified,
    expire_at: expireAt,
    payload: payload
  }, config.secretKey)

  return token
}
auth.generateToken = generateToken

function getUser (request) {
  var token = request.headers['authorization'] || null
  if (token) {
    var user = jwt.decode(token, config.secretKey).payload
    return user
  } else {
    return new Error('No token present.')
  }
}
auth.getUser = getUser

module.exports = auth
