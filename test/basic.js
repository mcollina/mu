'use strict'

require('./setup')
const t = require('tap')
const mu = require('..')()

let after = false

t.plan(8)

mu.match('hello:world', (ctx, msg, cb) => {
  t.equal(ctx, mu, 'mu instance is passed through')
  cb(null, { result: 42 })
})

mu.match({
  hello: 'matteo'
}, function (msg, cb) {
  t.equal(this, mu, 'mu instance is this')
  cb(null, { result: 24 })
})

mu.send({ hello: 'world' }, (err, result) => {
  t.error(err)
  t.ok(after, 'delayed execution')
  t.msgEqual(result, { result: 42 }, 'result matches')
})

mu.send('hello:matteo', (err, result) => {
  t.error(err)
  t.ok(after, 'delayed execution')
  t.msgEqual(result, { result: 24 }, 'result matches')
})

after = true
