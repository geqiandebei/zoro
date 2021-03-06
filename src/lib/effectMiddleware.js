import { isFunction, putCreator, selectCreator, splitType } from './util'
import { PLUGIN_EVENT } from './constant'

let _zoro

const middleware = ({ dispatch }) => next => async action => {
  _zoro.handleAction.apply(undefined, [action])
  _zoro.plugin.emit(PLUGIN_EVENT.ON_WILL_ACTION, action, _zoro.store)
  const { type } = action
  const handler = _zoro.getEffects()[type]
  if (isFunction(handler)) {
    try {
      _zoro.handleEffect.apply(undefined, [action])
      _zoro.plugin.emit(PLUGIN_EVENT.ON_WILL_EFFECT, action, _zoro.store)
      const { namespace } = splitType(type)
      const result = await handler(action, {
        selectAll: selectCreator(_zoro.store),
        select: selectCreator(_zoro.store, namespace),
        put: putCreator(_zoro.store, namespace),
      })
      return result
    } catch (e) {
      _zoro.handleError.apply(undefined, [e])
      _zoro.plugin.emit(PLUGIN_EVENT.ON_ERROR, e, _zoro.store)
      throw e
    } finally {
      _zoro.plugin.emit(PLUGIN_EVENT.ON_DID_EFFECT, action, _zoro.store)
    }
  }
  _zoro.plugin.emit(PLUGIN_EVENT.ON_DID_ACTION, action, _zoro.store)

  return next(action)
}

export default zoro => {
  _zoro = zoro
  return middleware
}
