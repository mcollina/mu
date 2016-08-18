'use strict'

const bloomrun = require('bloomrun')
const pool = require('reusify')(Desync)
const tinysonic = require('tinysonic')

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

  this._registry.add(tinysonic(pattern) || pattern, {
    func
  })
}

Mu.prototype.act = function (message, done) {
  message = tinysonic(message) || message
  const action = this._registry.lookup(message)

  if (!action) {
    process.nextTick(done, new Error('pattern not found'))
    return
  }

  const func = action.func

  const desync = pool.get()
  desync.done = done
  func(this, message, desync.func)
  desync.sync = false
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

function Desync () {
  var that = this

  this.next = null
  this.done = null
  this.sync = true

  this.func = function (err, result) {
    var done = that.done
    var sync = that.sync
    that.done = null
    that.sync = true
    pool.release(that)
    if (sync) {
      process.nextTick(done, err, result)
    } else {
      done(err, result)
    }
  }
}

module.exports = Mu
