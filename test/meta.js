'use strict'

require('./setup')
const t = require('tap')
const mu = require('..')()
const ids = []

t.plan(10)

mu.match('hello:world', (ctx, msg, cb) => {
  t.ok(msg.meta$, 'has meta$')
  ids.push(msg.meta$.id)
  cb(null, { result: msg.meta$.id })
})

mu.send('hello:world', onSend)
mu.send('hello:world', onSend)

function onSend (err, result) {
  t.error(err)
  t.ok(result.meta$, 'has meta$')

  const id = result.meta$.id

  t.ok(ids.indexOf(id) >= 0, 'id has been seen')
  t.msgEqual(result, { result: id }, 'result matches')
}
