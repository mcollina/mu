'use strict'

const client = require('../../http').client({
  port: process.env.SERVER_PORT || 3000
})

client.send(process.argv[2], console.log)
