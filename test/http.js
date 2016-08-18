'use strict'

const t = require('tap')
const mu = require('..')
const http = require('../http')

t.plan(4)

function A () {
  const instance = mu()

  instance.add({
    some: 'pattern'
  }, function (msg, cb) {
    t.deepEqual(msg, {
      some: 'pattern',
      from: 'http'
    })
    cb(null, { who: 'A' })
  })

  return instance
}

const server = http.server(A())

server.on('request', function (req) {
  // unref to avoid keepalive connections
  // to keep this open in tests
  req.client.unref()
})

server.listen(function (err) {
  t.error(err)

  const client = http.client(server.address())

  client.act({
    some: 'pattern',
    from: 'http'
  }, (err, result) => {
    t.error(err)
    t.deepEqual(result, { who: 'A' })
  })
})

t.tearDown(() => {
  server.close()
})
