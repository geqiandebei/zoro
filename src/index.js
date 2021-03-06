import 'regenerator-runtime/runtime'
import Zoro from './lib/zoro'
import { assert } from './lib/util'

let _zoro
function App(zoro) {
  _zoro = zoro
}

App.prototype.model = function(models) {
  if (models instanceof Array) {
    _zoro.injectModels.call(_zoro, models)

    return this
  }

  _zoro.injectModels.call(_zoro, [models])
  return this
}

App.prototype.use = function(plugins) {
  if (typeof plugins === 'function') {
    _zoro.use.call(_zoro, plugins)

    return this
  }

  assert(
    plugins instanceof Array,
    `the use param must be a function or a plugin Array, but we get ${typeof plugins}`,
  )

  plugins.forEach(plugin => _zoro.use.call(_zoro, plugin))

  return this
}

App.prototype.start = function() {
  const result = _zoro.setup.call(_zoro)
  this.store = _zoro.store
  return result
}

export const actions = function(namespace) {
  const models = _zoro.models
  assert(!!models[namespace], `the ${namespace} model not define`)
  return models[namespace].getActions()
}

export default (opts = {}) => new App(new Zoro(opts))
