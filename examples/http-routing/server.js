'use strict'

const mu = require('../../')()
const http = require('../../http')
const server = http.server(mu)

const c1 = http.client({ port: 3001 })
const c2 = http.client({ port: 3002 })

mu.route({
  to: '1',
  some: 'pattern'
}, c1)

mu.route({
  to: '2',
  some: 'pattern'
}, c2)

mu.route({
  some: 'pattern'
}, c1)

server.listen(process.env.PORT || 3000)

