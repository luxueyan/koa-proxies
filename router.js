const _ = require('lodash')
const createDebug = require('debug')
const debug = createDebug('koa-proxy:router')

exports.getTarget = async function (req, config) {
  let newTarget
  const router = config.router
  // console.log(req.query)
  if (_.isPlainObject(router)) {
    newTarget = getTargetFromProxyTable(req, router)
  } else if (_.isFunction(router)) {
    newTarget = await router(req)
  }

  return newTarget
}

function getTargetFromProxyTable(req, table) {
  let result
  const host = req.headers.host
  const path = req.url

  const hostAndPath = host + path

  _.forIn(table, (value, key) => {
    if (containsPath(key)) {
      if (hostAndPath.indexOf(key) > -1) {
        // match 'localhost:3000/api'
        result = table[key]
        debug('[HPM] Router table match: "%s"', key)
        return false
      }
    } else {
      if (key === host) {
        // match 'localhost:3000'
        result = table[key]
        debug('[HPM] Router table match: "%s"', host)
        return false
      }
    }
  })

  return result
}

function containsPath(v) {
  return v.indexOf('/') > -1
}
