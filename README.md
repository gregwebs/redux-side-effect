Redux Side Effect
=============

Side Effect [middleware](http://rackt.github.io/redux/docs/advanced/Middleware.html) for Redux.
Lets you specify side effects in your reducing function that dispatch new actions.

```js
npm install --save redux-side-effect
```


## Usage

There are multiple APIs available to suit your use case.
Underneath they all do the same thing. Let us know what works best for you.

### mkSideEffect

```js
import { mkSideEffect } from 'redux-side-effect'
const {sideEffect, sideEffectMiddleware} = mkSideEffect()
applyMiddleware(sideEffectMiddleware)(createStore)(reduce)
function reduce(state, action){
  switch (action.type){
    case "newState":
      // could just use setTimeout for this.
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

### actionSideEffectMiddleware

``` js
applyMiddleware(actionSideEffectMiddleware)(createStore)(reduce)
function reduce(state, action){
  switch (action.type){
    case "ApiCall":
      // sideEffect is placed directly on the action
      action.sideEffect(function(dispatch){
        doApiCall().then(function(){ dispatch({type: "Done"}) })
      })
      return Object.assign({}, state, {saving: true})

    case "Done":
  }
}
```

### timeouts

The above alternatives by default do not call setTimeout for you.
A function `sideEffectTimeout` is available which takes a time as a first parameter
and it wraps all side effects in setTimeout.


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

You can implement this functionality in a few lines of code for yourself if you have access to your store.

``` js
const sideEffects = []
// sideEffect needs to be in scope of your reducer function
function sideEffect(...effects) {
  for (var i in effects){
    sideEffects.push(effects[i])
  }
}
store.subscribe(() => {
  sideEffects.forEach(eff => eff(store.dispatch, store.getState))
})
```

This library exists for a few reasons
1) show a simple technique for dealing with side effects
2) to have integration that with redux dev tools.
3) You can use it in places that you don't have access to your store variable


## dev tools replay

Should be easy enough to avoid replaying side effects if that is desired.


## License

MIT
