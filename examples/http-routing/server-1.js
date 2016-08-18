'use strict'

const mu = require('../../')
const server = require('../../http').server(micro())

server.listen(process.env.PORT || 3001)

function micro () {
  const i = mu()
  i.add({
    some: 'pattern'
  }, function (ctx, msg, cb) {
    const hello = msg.name || 'world'
    cb(null, { from: '1', hello })
  })
  return i
}
