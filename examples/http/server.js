'use strict'

const micro = require('./micro')
const server = require('../../http').server(micro())

server.listen(process.env.PORT || 3000)
