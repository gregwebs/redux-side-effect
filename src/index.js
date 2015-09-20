export function sideEffect(state: any, ...effects) {
  if (!state) { return state }
  if (!state.meta) { state.meta = {} }
  state.meta.sideEffects = effects
  return state
}

export function sideEffectTimeout(state: any, timeout: number, ...effects) {
  if (!state.meta) {
    state.meta =
      { sideEffects: effects.map(eff => (dispatch, getState) => {
          setTimeout(eff(dispatch, getState), timeout) })
      }
  }
  return state
}

export function sideEffectMiddleware({ dispatch, getState }) {
  return next => action => {
    var sideEffects = action && action.meta && action.meta.sideEffects
    var result = next(action);
    if (sideEffects) {
      sideEffects.forEach((effect) => { effect(dispatch, getState) })
    }
    return result
  }
}
