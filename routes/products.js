var express = require('express')
var router = express.Router()
// var mongoose = require('mongoose')
var {Product, Sequelize, sequelize} = require('../models')
const Op = Sequelize.Op

/* GET ALL PRODUCTS */
router.get('/', function (req, res, next) {
  Product.findAll({}).then(products => {
    res.json(products)
  }).catch(err => {
    return next(err)
  })
})

router.get('/search/:query', function (req, res, next) {
  let searchCriteria = [
    `prod_name like :likeQuery`,
    `prod_desc like :likeQuery`
  ]

  if (parseFloat(req.params.query)) searchCriteria.push(`prod_price = :query`)
  if (parseFloat(req.params.query)) searchCriteria.push(`id = :query`)

  sequelize.query(`SELECT * FROM Products WHERE ${searchCriteria.join(' OR ')}`, {
    replacements: {likeQuery: `%${req.params.query}%`, query: req.params.query},
    type: Sequelize.QueryTypes.SELECT
  }).then(products => {
    res.json(products)
  }).catch(err => {
    console.log('err', err)
    return next(err)
  })
})

/* GET SINGLE PRODUCT BY ID */
router.get('/:id', function (req, res, next) {
  Product.findByPk(req.params.id).then(post => {
    res.statusCode = 404
    if (!post) return res.json({status: 'error', message: 'Requested product not found'})

    return res.json({id: post.id, prod_name: post.prod_name, prod_desc: post.prod_desc, prod_price: post.prod_price})
  }).catch(err => {
    return next(err)
  })
})

/* SAVE PRODUCT */
router.post('/', function (req, res, next) {
  Product.create(req.body).then(post => {
    res.json({status: 'success', data: { id: post.id }})
  }).catch(err => {
    return next(err)
  })
})

/* UPDATE PRODUCT */
router.put('/:id', function (req, res, next) {
  Product.update(req.body, {where: {id: req.params.id}}).then(post => {
    if (post[0]) return res.json({status: 'success'})
    else return res.json({status: 'error', message: 'Update failed'})
  }).catch(err => {
    return next(err)
  })
})

/* DELETE PRODUCT */
router.delete('/:id', function (req, res, next) {
  Product.destroy({where: {id: req.params.id}}).then(post => {
    if (post) return res.json({status: 'success'})
    else return res.json({status: 'error', message: 'Delete failed'})
  }).catch(err => {
    return next(err)
  })
})

module.exports = router
