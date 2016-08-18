'use strict'

const bloomrun = require('bloomrun')

function Mu () {
  if (!(this instanceof Mu)) {
    return new Mu()
  }

  // maybe indexing might be configurable
  // set to depth for compatibility with Seneca
  this._registry = bloomrun({ indexing: 'depth' })
}

Mu.prototype.add = function (pattern, func) {
  func = wrap(func)

  this._registry.add(pattern, {
    func
  })
}

Mu.prototype.act = function (message, done) {
  const action = this._registry.lookup(message)

  if (!action) {
    process.nextTick(done, new Error('pattern not found'))
    return
  }

  const func = action.func
  // needed to dezalgo
  var sync = true

  // TODO avoid creating a closure
  func(this, message, function (err, result) {
    if (sync) {
      process.nextTick(done, err, result)
    } else {
      done(err, result)
    }
  })

  sync = false
}

Mu.prototype.route = function (pattern, instance) {
  this.add(pattern, function (ctx, msg, cb) {
    instance.act(msg, cb)
  })
}

function wrap (func) {
  if (func.length === 2) {
    return function (ctx, msg, cb) {
      func.call(ctx, msg, cb)
    }
  }
  return func
}

module.exports = Mu
