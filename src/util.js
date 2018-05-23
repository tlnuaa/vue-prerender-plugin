import path from 'path'
import rm from 'rimraf'

export async function getAndRemovePrerenderPaths ({router, routeParams, outputDir, extraRoutes, excludeRoutes}) {
  const routes = router.options ? router.options.routes : router
  const prerenderPaths = [...extraRoutes]

  const getRouterPaths = function (route, path = '') {
    if (Array.isArray(route)) {
      for (let item of route) {
        getRouterPaths(item, path)
      }
    } else if (route.path !== undefined) {
      if (route.path[0] === '/') {
        path = route.path
      } else {
        path = `${path}/${route.path}`
      }

      if (path.includes(':')) {
        let pathParams = routeParams[path]
        if (pathParams) {
          let paths = [path]
          for (let key in pathParams) {
            let newPaths = []
            for (let item of paths) {
              for (let value of pathParams[key]) {
                let newPath = item.replace(`/${key}/`, `/${value}/`)
                let regexp = new RegExp(`/${key}$`)
                newPath = newPath.replace(regexp, `/${value}`)
                if (item !== newPath) {
                  newPaths.push(newPath)
                }
              }
            }
            paths = newPaths
          }

          for (let path of paths) {
            if (!path.includes(':')) {
              prerenderPaths.push(path)
            }
          }
        }
      } else {
        prerenderPaths.push(path)
      }

      if (Array.isArray(route.children) && route.children.length > 0) {
        getRouterPaths(route.children, path)
      }
    }
  }

  getRouterPaths(routes)

  const rootRegEx = /^\/[^/]+/
  const rootPrerenderPaths = new Set()

  for (let prerenderPath of prerenderPaths) {
    let rootPrerenderPath = rootRegEx.exec(prerenderPath)

    if (Array.isArray(rootPrerenderPath)) {
      rootPrerenderPaths.add(rootPrerenderPath[0])
    }
  }

  const removePathPromises = [...rootPrerenderPaths].map((v) => new Promise((resolve, reject) => {
    rm(path.join(outputDir, v), () => resolve())
  }))

  await Promise.all(removePathPromises)

  return new Set(prerenderPaths.filter(v => !excludeRoutes.includes(v)))
}
