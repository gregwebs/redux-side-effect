function mkSideEffectCollector(sideEffects){
  return function sideEffect(...effects) {
    for (var i in effects){
      sideEffects.push(effects[i])
    }
  }
}

function mkSideEffectTimeout(sideEffect){
  return function sideEffectTimeout(timeout: number, ...effects) {
    return sideEffect(effects.map(eff => (dispatch, getState) => {
      setTimeout(eff(dispatch, getState), timeout)
    }))
  }
}

function mkDrainSideEffects(sideEffects, dispatch, getState){
  return function drainSideEffects(){
    while (sideEffects.length > 0){
      sideEffects.shift()(dispatch, getState)
    }
  }
}


export function mkSideEffect() {
  let sideEffects = []
  let sideEffect = mkSideEffectCollector(sideEffects)

  function sideEffectMiddleware({ dispatch, getState }) {
    const drainSideEffects = mkDrainSideEffects(sideEffects, dispatch, getState)
    return next => action => {
      let result = next(action)
      drainSideEffects()
      return result
    }
  }

  return { sideEffect: sideEffect
         , sideEffectTimeout: mkSideEffectTimeout(sideEffect)
         , sideEffectMiddleware: sideEffectMiddleware
         }
}

export function actionSideEffectMiddleware({ dispatch, getState }) {
  const sideEffects = [];
  const sideEffect = mkSideEffectCollector(sideEffects)
  const sideEffectTimeout = mkSideEffectTimeout(sideEffect)
  const drainSideEffects = mkDrainSideEffects(sideEffects, dispatch, getState)
  return next => action => {
    action.sideEffect = sideEffect
    action.sideEffectTimeout = sideEffectTimeout
    let result = next(action);
    drainSideEffects()
    return result;
  }
}
