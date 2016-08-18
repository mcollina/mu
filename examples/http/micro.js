'use strict'

const mu = require('../../')

function build () {
  const i = mu()
  i.match('some:pattern', function (ctx, msg, cb) {
    const result = msg.name || 'world'
    cb(null, { hello: result })
  })
  return i
}

module.exports = build
