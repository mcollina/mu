'use strict'

const t = require('tap')
const mu = require('..')

t.plan(4)

function A () {
  const instance = mu()

  instance.match({
    some: 'pattern'
  }, function (msg, cb) {
    cb(null, { who: 'A' })
  })

  return instance
}

function B () {
  const instance = mu()

  instance.match({
    some: 'pattern'
  }, function (msg, cb) {
    cb(null, { who: 'B' })
  })

  return instance
}

const main = mu()

main.route({
  some: 'pattern'
}, B())

main.route({
  some: 'pattern',
  to: 'A'
}, A())

main.send({
  some: 'pattern',
  to: 'A'
}, (err, result) => {
  t.error(err)
  t.deepEqual(result, { who: 'A' })
})

main.send({
  some: 'pattern'
}, (err, result) => {
  t.error(err)
  t.deepEqual(result, { who: 'B' })
})
