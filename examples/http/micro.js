'use strict'

const mu = require('../../')()

mu.add({
  some: 'pattern'
}, function (ctx, msg, cb) {
  const result = msg.name || 'world'
  cb(null, { hello: result })
})

module.exports = mu
