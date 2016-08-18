'use strict'

const mu = require('../../')
const server = require('../../http').server(micro())

server.listen(process.env.PORT || 3002)

function micro () {
  const i = mu()
  i.match({
    some: 'pattern'
  }, function (ctx, msg, cb) {
    const hello = msg.name || 'world'
    cb(null, { from: '2', hello })
  })
  return i
}
