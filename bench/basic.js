'use strict'

const fastbench = require('fastbench')

const seneca = require('seneca')()
seneca.add({
  hello: 'world'
}, function (msg, cb) {
  cb(null, { something: 'else' })
})

const mu = require('..')()
mu.add({
  hello: 'world'
}, function (ctx, msg, cb) {
  cb(null, { something: 'else' })
})

const run = fastbench([
  function callNextTick (cb) {
    process.nextTick(cb)
  },
  function callSetImmediate (cb) {
    setImmediate(cb)
  },
  function actSeneca (cb) {
    seneca.act({ hello: 'world' }, cb)
  },
  function actMu (cb) {
    mu.act({ hello: 'world' }, cb)
  }
], 10000)

run(run)
