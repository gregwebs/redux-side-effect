export function mkSideEffect() {
  var sideEffects = []
  function sideEffectMiddleware({ dispatch, getState, subscribe }) {
    subscribe(() => {
      while (sideEffects.length > 0){
        sideEffects.shift()(dispatch, getState)
      }
    })

    return next => action => next(action)
  }

  function sideEffect(...effects) {
    for (var i in effects){
      sideEffects.push(effects[i])
    }
  }

  function sideEffectTimeout(timeout: number, ...effects) {
    return sideEffect(effects.map(eff => (dispatch, getState) => {
      setTimeout(eff(dispatch, getState), timeout)
    }))
  }

  return { sideEffect: sideEffect
         , sideEffectTimeout: sideEffectTimeout
         , sideEffectMiddleware: sideEffectMiddleware
         }
}
