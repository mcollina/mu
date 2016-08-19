'use strict'

const bloomrun = require('bloomrun')
const pool = require('reusify')(Desync)
const tinysonic = require('tinysonic')
const uuid = require('uuid')

function Mu () {
  if (!(this instanceof Mu)) {
    return new Mu()
  }

  this.id = baseId()
  this._count = 0

  // maybe indexing might be configurable
  // set to depth for compatibility with Seneca
  this._registry = bloomrun({ indexing: 'depth' })
}

Mu.prototype.match = function (pattern, func) {
  func = wrap(func)

  this._registry.add(tinysonic(pattern) || pattern, {
    func
  })
}

Mu.prototype.send = function (message, done) {
  message = tinysonic(message) || message
  const action = this._registry.lookup(message)

  if (!action) {
    process.nextTick(done, new Error('pattern not found'))
    return
  }

  addMeta(message, null, this)

  if (this._count === 2147483647) {
    this.id = baseId() // rebase
    this._count = 0
  }

  const func = action.func

  const desync = pool.get()
  desync.done = done
  desync.msg = message
  func(this, message, desync.func)
  desync.sync = false
}

Mu.prototype.route = function (pattern, instance) {
  this.match(pattern, function (ctx, msg, cb) {
    instance.send(msg, cb)
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

function addMeta (msg, prev, that) {
  msg.meta$ = {
    id: prev && prev.meta$.id || that.id + '/' + (that._count++)
  }
}

function Desync () {
  var that = this

  this.next = null
  this.done = null
  this.sync = true
  this.msg = null

  this.func = function (err, result) {
    var done = that.done
    var sync = that.sync
    addMeta(result, that.msg)
    that.done = null
    that.sync = true
    that.msg = null
    pool.release(that)
    if (sync) {
      process.nextTick(done, err, result)
    } else {
      done(err, result)
    }
  }
}

function baseId () {
  return new Buffer(uuid.parse(uuid.v4())).toString('base64')
}

module.exports = Mu
