'use strict'

const fastbench = require('fastbench')

const seneca = require('seneca')
function buildSeneca () {
  const server = seneca()

  server.add({
    hello: 'world'
  }, function (msg, cb) {
    cb(null, { something: 'else' })
  })

  server.listen()

  return seneca().client()
}
const senecaClient = buildSeneca()

const mu = require('..')
const http = require('../http')

function buildMu () {
  const micro = mu()
  const server = http.server(micro)

  micro.add({
    hello: 'world'
  }, function (ctx, msg, cb) {
    cb(null, { something: 'else' })
  })

  server.listen(3042)

  return http.client({ port: 3042 })
}
const muClient = buildMu()

const run = fastbench([
  function actSeneca (cb) {
    senecaClient.act({ hello: 'world' }, cb)
  },
  function actMu (cb) {
    muClient.act({ hello: 'world' }, cb)
  }
], 10000)

setTimeout(function () {
  run(function () {
    run(function () {
      process.exit(0)
    })
  })
}, 100)
