import fs from 'fs'
import path from 'path'
import { minify } from 'html-minifier'
import mkdirp from 'mkdirp'
import puppeteer from 'puppeteer'
import urljoin from 'url-join'
import { getAndRemovePrerenderPaths } from './util'

const defaultOptions = {
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
    keepClosingSlash: true,
  },
}

function VuePrerenderPlugin (options) {
  this.options = Object.assign({}, defaultOptions, options)
}

VuePrerenderPlugin.prototype.apply = function (compiler) {
  if (!this.options.needPrerender) return

  compiler.plugin('after-emit', async (compilation, callback) => {
    console.log('[vue-prerender-plugin] Start prerender')
    const prerenderPaths = await getAndRemovePrerenderPaths(this.options)

    const browser = await puppeteer.launch(this.options.puppeteerLaunchOption)
    const page = await browser.newPage()
    const frame = page.mainFrame()

    const savePrerenderPage = async (prerenderPath) => {
      let url = urljoin(this.options.baseUrl, prerenderPath)
      let outputPath = path.join(this.options.outputDir, prerenderPath)
      let outputFile = path.join(outputPath, this.options.outputFileName)

      console.log(`[vue-prerender-plugin] Prerendering ${url} to ${outputFile}`)

      try {
        await page.goto(url, this.options.commonQuery)
        await frame.waitFor(this.options.waitFor)
      } catch (e) {
        console.error(`[vue-prerender-plugin] Wait for ${this.options.waitFor} failed, please make sure ${url} could be accessed`)
        process.exit(1)
      }
      let data = await frame.content()

      if (this.options.minify) {
        data = minify(data, this.options.minify)
      }

      await new Promise((resolve, reject) => {
        mkdirp(outputPath, () => resolve())
      })

      fs.writeFileSync(outputFile, data)
    }

    for (let prerenderPath of prerenderPaths) {
      await savePrerenderPage(prerenderPath)
    }

    await browser.close()
    callback()
  })
}

module.exports = VuePrerenderPlugin
