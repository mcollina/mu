'use strict'

const tap = require('tap')

// convenience
if (module === require.main) {
  tap.pass('ok')
} else {
  tap.Test.prototype.addAssert('msgEqual', 1, function (found, msg, wanted) {
    const meta = found.meta$
    delete found.meta$
    const result = this.deepEqual(found, wanted, msg)

    found.meta$ = meta

    return result
  })
}
