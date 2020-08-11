# Koa Proxies with router config - Forked from [koa-proxies](https://github.com/vagusX/koa-proxies.git) and rewrited!

![NPM](https://img.shields.io/npm/v/koa-proxies.svg)
[![TavisCI Build](https://img.shields.io/travis/vagusX/koa-proxies.svg)](https://travis-ci.org/vagusX/koa-proxies)
[![CircieCI Build](https://img.shields.io/circleci/project/github/vagusX/koa-proxies.svg)](https://circleci.com/gh/vagusX/koa-proxies)
[![Coverage](https://img.shields.io/codecov/c/github/vagusX/koa-proxies.svg)](https://codecov.io/gh/vagusX/koa-proxies)
[![NPM Downloads](https://img.shields.io/npm/dm/koa-proxies.svg)](https://www.npmjs.com/package/koa-proxies)
[![Greenkeeper badge](https://badges.greenkeeper.io/vagusX/koa-proxies.svg)](https://greenkeeper.io/)

> [Koa@2.x/next](https://github.com/koajs/koa) middlware for http proxy

Add router config like [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware/)
Powered by [`http-proxies`](https://github.com/vagusX/koa-proxies.git) / [`http-proxy-middleware`](https://github.com/chimurai/http-proxy-middleware/)


## Installation

```bash
$ npm install koa-proxies-router --save
```

## Options

### http-proxy events

```js
options.events = {
  error(err, req, res) {},
  proxyReq(proxyReq, req, res) {},
  proxyRes(proxyRes, req, res) {}
}
```

### log option

```js
// enable log
options.logs = true; // or false

// custom log function
options.logs = (ctx, target) {
  console.log('%s - %s %s proxy to -> %s', new Date().toISOString(), ctx.req.method, ctx.req.oldPath, new URL(ctx.req.url, target))
}
```

## Usage

```js
// dependencies
const Koa = require('koa')
const proxy = require('koa-proxies')
const httpsProxyAgent = require('https-proxy-agent')

const app = new Koa()

// middleware
app.use(proxy('/octocat', {
  target: 'https://api.github.com/users', // if router config exist this will be ignored
  router: (req) {
    if (req.query._proxy) {
      return _proxy
    }
    return 'https://api.github.com/users',
  },
  changeOrigin: true,
  agent: new httpsProxyAgent('http://1.2.3.4:88'), // if you need or just delete this line
  rewrite: path => path.replace(/^\/octocat(\/|\/\w+)?$/, '/vagusx'),
  logs: true
}))
```

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
