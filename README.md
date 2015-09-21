Redux Side Effect
=============

Side Effect [middleware](http://rackt.github.io/redux/docs/advanced/Middleware.html) for Redux.
Lets you specify side effects in your reducing function that dispatch new actions.

```js
npm install --save redux-side-effect
```


## Usage

```js
import { mkSideEffect } from 'redux-side-effect'
const {sideEffect, sideEffectMiddleWare} = mkSideEffect()
applyMiddleware(sideEffectMiddleWare)(createStore)(reduce)
function reduce(state, action){
  switch (action.type){
    case "newState":
      // could jsut use setTimeout for this.
      // Except in the future this middleware may play nicely with redux dev tools
      sideEffect(function analytics(){ _gaq.push(['_trackEvent', 'Event', 'Detail']) })
      return action.newState

    case "ApiCall":
      // sideEffect allows access to dispatch (and getState)
      sideEffect(function(dispatch){
        doApiCall().then(function(){ dispatch({type: "Done"}) })
      })
      return Object.assign({}, state, {saving: true})

    case "Done":
  }
}
```


## Motivation

The goal of this middleware is to maintain the simplicty and light-weight API of Redux when dealing with asynchronous actions.

Redux already adds a layer of indirection. When compared to Flux, it is simple, but I am comparing with using neither and I want something that is very simple and straightforward to use.

### redux-thunk

The existing redux-thunk middleware does not allow for returning both state and effects at the same time, leading users to create artificial events. So the `"ApiCall"` from the example code would need to add a new action that gets dispatched in the thunk, or the code needs to be restructured so that the original dispatching of the event is from a thunk that also performs the side effect (which may or may not be natural).

There is a more fundamental problem to redux-thunk: it changes the type of a reducer and the types accepted by middlewares in the store. This means middlewares now either need to be thunk-aware or properly placed in the stack.
The popular concept of middleware comes from web development where the type of a middleware is always `Request -> Response`. If the thunk concept were changed from just a middleware to a first-class concept, then this problem could perhaps be avoided.


### redux-effect-reducers

Conceptually the same as this package, but also makes the mistake of changing the type.
That introduces a lot of implementation and API complexity.


### redux-effects

Does not changes the reducer type, this is a very principled approach. However, it adds a lot of complexity compared to the side-effect approach here. Every async function call and its arguments must now be describe in JSON as a reducer action. The reducer action JSON is turned into a real function call in middleware.
The upside is that since executable code is now turned into interpreted data, middlewares and meta-programming have more power. However, I find this layer of inderection quite scary without having strong types (one could get strong typing from FB Flow, but none of the libs come with types).

### Oh no, my reducer is no longer pure!

Keep in mind that redux is inspired by Elm. In the latest version of Elm,
the reducer returns both the new state and `Effect`s.
This library attempts to mimic how Effects are handled in Elm within the constraints of Javascript and Redux.

The point of purity is not that side effects, mutations, and actions are never performed, but that we are very deliberate about how we do those things. Users of this library will still be focusing on writing pure reducing functions, and they will be aware when they are not.


## Code

The main reason why this library exists and that you don't just call setTimeout around your async calls is that the middleare has access to the store functions.
However, with access to the store variable, you can achieve the same thing without middleware.

This code itself is unfortunately based on side effects, so this is encapsulated by the exported function `mkSideEffect`.
`sideEffect`, which is returned by `mkSideEffect`, registers code that will be executed once there is a state change

``` js
export function mkSideEffect() {
  var sideEffects = []
  function sideEffectMiddleware({ dispatch, getState }) {
    return next => action => {
      var result = next(action)
      while (sideEffects.length > 0){
        sideEffects.shift()(dispatch, getState)
      }
      return result
    }
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
A function `sideEffectTimeout` is available which takes a time as a first parameter
and it wraps all side effects in setTimeout.


## dev tools replay

Should be easy enough to avoid replaying side effects if that is desired.


## License

MIT
