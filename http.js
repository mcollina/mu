'use strict'

const http = require('http')
const bodyParser = require('body-parser')
const concat = require('concat-stream')
const Parse = require('fast-json-parse')
const pump = require('pump')

function server (mu) {
  const json = bodyParser.json()
  return http.createServer(handle)

  function handle (req, res) {
    // unref to avoid keepalive connections
    // to keep this open in tests
    req.client.unref()

    json(req, res, function (err) {
      if (err) {
        res.statusCode = err.statusCode
        res.end(err.expose ? err.message : 'something went wrong')
        return
      }

      mu.act(req.body, function (err, result) {
        if (err) {
          res.statusCode = 500
          res.end(err.message)
          return
        }

        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result))
      })
    })
  }
}

module.exports.server = server

function client (opts) {
  // TODO more config for the agent
  const agent = new http.Agent({
    // use keep alive to speed things up
    keepAlive: true
  })

  // avoid to keep the client open
  // if nothing is happening
  // const old = agent.createConnection
  // agent.createConnection = function (opts) {
  //   const stream = old(opts)
  //   stream.unref()
  //   return stream
  // }

  return {
    act,
    close
  }

  function act (msg, cb) {
    const postData = JSON.stringify(msg)
    const options = {
      hostname: opts.hostname || opts.host,
      port: opts.port,
      path: '/_act',
      method: 'POST',
      agent: agent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }
    var req = http.request(options)
    req.end(postData)
    req.on('response', function (res) {
      if (res.statusCode > 299) {
        res.resume()
        return cb(new Error('wrong status code'))
      }

      pump(res, concat(function (body) {
        const parse = new Parse(body)
        cb(parse.err, parse.value)
      }), function (err) {
        if (err) {
          return cb(err)
        }
      })
    })
  }

  function close () {
    agent.destroy()
  }
}

module.exports.client = client
