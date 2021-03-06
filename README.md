<h1 align="center">Vue Prerender Plugin</h1>
<p align="center">
  <em>a webpack plugin about prerendering vue websites base on vue-router </em>
</p>

---

<div align="center">

![npm version](https://img.shields.io/npm/v/vue-prerender-plugin.svg)
![npm downloads](https://img.shields.io/npm/dt/vue-prerender-plugin.svg)
![Dependency Status](https://img.shields.io/david/lennontu/vue-prerender-plugin.svg)
![license](https://img.shields.io/github/license/lennontu/vue-prerender-plugin.svg)

</div>

---

<div align="center">

[![NPM](https://nodei.co/npm/vue-prerender-plugin.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/vue-prerender-plugin/)

</div>

## Goal of vue-prerender-plugin

This plugin provide a way to prerender vue SPAs when webpack build, and save the prerender result to target dir

## [vue-prerender-plugin-demo](https://github.com/lennontu/vue-prerender-plugin-demo)
This demo would prerender a vue SPA which is generated by vue-cli(webpack template)

### Usage (`webpack.config.js`)
```js
const VuePrerenderPlugin = require('vue-prerender-plugin')

module.exports = {
  plugins: [
    ...
    // this is equal to new VuePrerenderPlugin(), because all of the options are default ,
    new VuePrerenderPlugin({
      baseUrl: 'http://127.0.0.1/',
      commonQuery: {},
      outputDir: path.resolve(process.cwd(), 'dist'),
      outputFileName: 'index.html',
      needPrerender: true,
      router: [],
      routeParams: {},
      extraRoutes: [],
      excludeRoutes: [],
      puppeteerLaunchOption: {},
      waitFor: '#app div',
      minify: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        decodeEntities: true,
        keepClosingSlash: true
      }
    })
  ]
}
```


## Documentation

### Plugin Options

| Option | Type | Default | Description |
|-------------|-------------------------------------------|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| baseUrl | String | `http://127.0.0.1/` | The base prerender url. |
| commonQuery | Object | `{}` | The Common Query which would be add to all prerender url. |
| ouputDir | String | `path.resolve(process.cwd(), 'dist')` | Where the prerendered pages would be output.|
| outputFileName | String | `index.html` | Which filename the prerendered pages would be saved as.|
| needPrerender | Boolean | `true` | Whether to prerender. Recommend value is `process.env.npm_config_prerender`|
| router | Array\|Vue Router Instance | `[]` | Router to generate prerender routes. See the [Option.router](#Option.router) |
| routeParams | Object | `{}` | RouterParams to generate prerender routes. See the [Option.routeParams](#Option.routeParams) |
| extraRoutes | Array | `[]` | Extra routes to render |
| excludeRoutes | Array | `[]` | Routes not to render |
| puppeteerLaunchOption | Object | `{}` | How Puppeteer launch. See the [puppeteer launch options](https://github.com/GoogleChrome/puppeteer/blob/v1.4.0/docs/api.md#puppeteerlaunchoptions) |
| waitFor | String\|Number\|Function | `#app div` | Wait for prerender. See the [puppeteer wait for](https://github.com/GoogleChrome/puppeteer/blob/v1.4.0/docs/api.md#pagewaitforselectororfunctionortimeout-options-args) |
| minify | Object | `{ collapseBooleanAttributes: true, collapseWhitespace: true, decodeEntities: true, keepClosingSlash: true }` | Minify the result HTML. See the [minify options](https://github.com/kangax/html-minifier#options-quick-reference). |

**:point_right: Final prerender routes would be router routes + extraRoutes - excludeRoutes.**

#### Option.router

route example
```js
// Array
[
  {
    path: '/parent',
    children: [
      {
        path: 'detail'
      },
      {
        path: 'child'
      }
    ]
  },
  {
    path: '/user/:id'
  },
  {
    path: '/article/:id'
  },
  {
    path: '/user/:id/view/:otherId'
  }
]
```
```js
// Vue Router Instance
new Router({
  mode: 'history',
  routes: [
    {
      path: '/parent',
      name: 'Parent',
      component: () => import('@/pages/Parent'),
      children: [
        {
          path: 'detail',
          name: 'Detail',
          component: () => import('@/pages/Detail')
        },
        {
          path: 'child',
          name: 'Child',
          component: () => import('@/pages/Child')
        }
      ]
    },
    {
      path: '/user/:id',
      name: 'User',
      component: () => import('@/pages/User'),
      props: true
    },
    {
      path: '/article/:id',
      name: 'Article',
      component: () => import('@/pages/Article'),
      props: true
    },
    {
      path: '/user/:id/view/:otherId',
      name: 'User-View',
      component: () => import('@/pages/UserView'),
      props: true
    }
  ]
```

#### Option.routeParams

routeParams example
```js
{
  "/user/:id": {
    ":id": [1, 2, 3, 4]
  },
  "/article/:id": {
    ":id": [1, 2, 3, 4]
  },
  "/user/:id/view/:otherId": {
    ":id": [1, 2, 3, 4],
    ":otherId": [1, 2, 3, 4]
  }
}
```
