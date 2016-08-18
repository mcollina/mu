'use strict'

const mu = require('./micro')
const server = require('../../http').server(mu)

server.listen(process.env.PORT || 3000)
