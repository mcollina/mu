'use strict'

const fastbench = require('fastbench')
const seneca = require('seneca')()
const mu = require('..')()

seneca.add({
  hello: 'world'
}, function (msg, cb) {
  cb(null, { something: 'else' })
})

mu.add({
  hello: 'world'
}, function (msg, cb) {
  cb(null, { something: 'else' })
})

const run = fastbench([
  function actSeneca (cb) {
    seneca.act({ hello: 'world' }, cb)
  },
  function actMu (cb) {
    mu.act({ hello: 'world' }, cb)
  }
], 10000)

run(run)
