var express = require('express')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var cors = require('cors')
var favicon = require('serve-favicon')

var index = require('./routes/index')
var products = require('./routes/products')
var jobs = require('./routes/jobs')
var user = require('./user/userCtrl')
var auth = require('./user/auth')
var app = express()

let { sequelize } = require('./models')

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')

    sequelize.sync().then(() => {
      console.log('Synced database successfully.')
    })
  })
  .catch(err => {
    console.error('Something went wrong in db:', err)
  })

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({'extended': 'true'}))
app.use(bodyParser.json({type: 'application/vnd.api+json'}))
app.use(methodOverride())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(cors())
app.use('/', index)
app.all('/api/v1/*', [auth.authenticate])
app.use('/api/v1/products', products)
app.use('/api/v1/jobs', jobs)
app.use('/user', user)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

process.on('uncaughtException', function (err) {
  console.log('err', err)
  console.log('Uncaught: Server crash reason ----------------------------------------------------', err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  console.log('Server crash reason ----------------------------------------------------', err)

  // render the error page
  res.status(err.status || 500)
  res.json(err.message)
})

module.exports = app
