Redux Side Effect
=============

Side Effect [middleware](http://rackt.github.io/redux/docs/advanced/Middleware.html) for Redux.
Lets you specify side effects in your reducing function that dispatch new actions.

```js
npm install --save redux-side-effect
```


## Usage

```js
const {sideEffect, sideEffectMiddleWare} = mkSideEffect()
applyMiddleware(sideEffectMiddleWare)(createStore)(reduce)
function reduce(state, action){
  switch (action.type){
    case "newState":
      sideEffect(function analytics(){ _gaq.push(['_trackEvent', 'Event', 'Detail']) })
      return action.newState

    case "ApiCall":
      return Object.assign({}, state, {saving: true})
      sideEffect(function(dispatch){
        doApiCall().then(function(){ dispatch({type: "Done"}) })
      })

    case "Done":
  }
}
```


## Motivation

The existing redux-thunk middleware does not allow for returning both state and effects at the same time. This leads users to create artificial events or to try even more complex solutions for their effects. The redux-effect-reducers package is similar in spirit, but introduces a lot of implementation and API complexity.

The goal of this middleware is to maintain the simplicty and light-weight API of Redux when dealing with asynchronous actions.


### Oh no, my reducer is no longer pure!

Keep in mind that redux is inspired by Elm. In the latest version of Elm,
the reducer returns both the new state and `Effect`s.
This library attempts to mimic how Effects are handled in Elm within the constraints of Javascript and Redux.

The point of purity is not that side effects, mutations, and actions are never performed, but that we are very deliberate about how we do those things. Users of this library will still be mostly writing pure reducing functions, and be aware when they are not.


## Code

The main reason why this library exists and that you don't just call setTimeout around your async calls is that the middleare has access to the store functions.
However, if you have access to the store variable, you can achieve the same thing without middleware.

This code itself is based on side effects. It is encapsulated by `mkSideEffect`.
The returned `sideEffect` registers code that will be executed once there is a state change

``` js
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

  return { sideEffect: sideEffect
         , sideEffectMiddleware: sideEffectMiddleware
         }
}
```

Note that by default setTimeout is not called for you.
A function `sideEffectTimeout` is available which takes a time as a second parameter
and it wraps all side effects in setTimeout.


## dev tools replay

Didn't test this, but side effects should not get replayed.


## License

MIT
