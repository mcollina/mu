'use strict'

const client = require('../../http').client({
  port: process.env.SERVER_PORT || 3000
})

const msg = {
  to: process.argv[2],
  some: 'pattern',
  name: process.argv[3]
}

client.act(msg, console.log)
