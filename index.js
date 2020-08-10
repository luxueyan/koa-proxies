/**
 * Dependencies
 */
const { URL } = require('url')
const HttpProxy = require('http-proxy')
const pathMatch = require('path-match')
const router = require('./router')
const createDebug = require('debug')
/**
 * Constants
 */
const debug = createDebug('koa-proxy:index')
const proxy = HttpProxy.createProxyServer()
const route = pathMatch({
  // path-to-regexp options
  sensitive: false,
  strict: false,
  end: false
})

let eventRegistered = false

function logger (ctx, target) {
  debug('%s - %s %s proxy to -> %s', new Date().toISOString(), ctx.req.method, ctx.req.oldPath, new URL(ctx.req.url, target))
}

/**
 * Koa Http Proxy Middleware
 */
module.exports = (path, options) => async (ctx, next) => {
  // create a match function
  const match = route(path)
  if (!match(ctx.path)) return next()

  let opts = Object.assign({}, options)
  if (typeof options === 'function') {
    const params = match(ctx.path)
    opts = options.call(options, ctx, params)
  }

  // router support
  if (opts.router) {
    const newTarget = await router.getTarget(ctx.request, opts)
    if (newTarget) {
      debug('[HPM] Router new target: %s -> "%s"', options.target, newTarget)
      opts.target = newTarget
    }
  }
  // object-rest-spread is still in stage-3
  // https://github.com/tc39/proposal-object-rest-spread
  const { logs, rewrite, events } = opts

  const httpProxyOpts = Object.keys(opts)
    .filter((n) => ['logs', 'rewrite', 'events'].indexOf(n) < 0)
    .reduce((prev, cur) => {
      prev[cur] = opts[cur]
      return prev
    }, {})

  return new Promise((resolve, reject) => {
    ctx.req.oldPath = ctx.req.url

    if (typeof rewrite === 'function') {
      ctx.req.url = rewrite(ctx.req.url, ctx)
    }

    if (logs) {
      typeof logs === 'function' ? logs(ctx, opts.target) : logger(ctx, opts.target)
    }
    if (events && typeof events === 'object' && !eventRegistered) {
      Object.entries(events).forEach(([event, handler]) => {
        proxy.on(event, handler)
      })
      eventRegistered = true
    }

    // Let the promise be solved correctly after the proxy.web.
    // The solution comes from https://github.com/nodejitsu/node-http-proxy/issues/951#issuecomment-179904134
    ctx.res.on('close', () => {
      reject(new Error(`Http response closed while proxying ${ctx.req.oldPath}`))
    })

    ctx.res.on('finish', () => {
      resolve()
    })

    proxy.web(ctx.req, ctx.res, httpProxyOpts, (e) => {
      const status = {
        ECONNREFUSED: 503,
        ETIMEOUT: 504
      }[e.code]
      ctx.status = status || 500
      resolve()
    })
  })
}

module.exports.proxy = proxy
