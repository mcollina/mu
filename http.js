'use strict'

const http = require('http')
const Parse = require('fast-json-parse')
const reusify = require('reusify')

function server (mu) {
  const pool = reusify(Waiter)

  return http.createServer(handle)

  function handle (req, res) {
    req.res = res
    req.body = ''
    req.setEncoding('utf8')
    req.on('data', accumulate)
    req.on('end', bodyParsed)
    req.on('error', bodyParsed)
  }

  function bodyParsed (err) {
    const res = this.res
    if (err) {
      res.statusCode = err.statusCode
      res.end(err.expose ? err.message : 'something went wrong')
      return
    }

    const parse = new Parse(this.body)

    if (parse.err) {
      res.statusCode = 500
      res.end(parse.err.message)
      return
    }

    const waiter = pool.get()
    waiter.res = res
    mu.send(parse.value, waiter.func)
  }

  function Waiter () {
    this.next = null
    this.res = null

    const that = this
    this.func = function (err, result) {
      const res = that.res
      that.res = null
      if (err) {
        res.statusCode = 500
        res.end(err.message)
        return
      }

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(result))
      pool.release(that)
    }
  }
}

module.exports.server = server

function client (opts) {
  // TODO more config for the agent
  const agent = new http.Agent({
    // use keep alive to speed things up
    keepAlive: true
  })

  return {
    send,
    close
  }

  function send (msg, cb) {
    const postData = JSON.stringify(msg)
    const options = {
      hostname: opts.hostname || opts.host,
      port: opts.port,
      path: '/_send',
      method: 'POST',
      agent: agent,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    var req = http.request(options)
    req.end(postData)
    req.cb = cb
    req.on('response', onRes)
  }

  function close () {
    agent.destroy()
  }
}

function onRes (res) {
  const cb = this.cb
  if (res.statusCode > 299) {
    res.resume()
    return cb(new Error('wrong status code'))
  }

  res.body = ''
  res.setEncoding('utf8')
  res.on('data', accumulate)
  res.done = cb
  res.on('end', finish)
  res.on('error', cb)
}

function accumulate (chunk) {
  this.body += chunk
}

function finish () {
  const parse = new Parse(this.body)
  const cb = this.done
  cb(parse.err, parse.value)
}

module.exports.client = client
