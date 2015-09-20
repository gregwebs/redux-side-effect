Redux Side Effect
=============

Side Effect [middleware](http://rackt.github.io/redux/docs/advanced/Middleware.html) for Redux.
Lets you specify side effects in your reducing function that dispatch new actions.

```js
npm install --save redux-side-effect
```


## Usage

```js
function reduce(state, action){
  switch (action.type){
    case "newState":
      function analytics(){ _gaq.push(['_trackEvent', 'Event', 'Detail']) }
      return sideEffect(action.newState, analytics)

    case "ApiCall":
      return sideEffect(
          Object.assign({}, state, {saving: true})
        , function(dispatch){
            doApiCall().then(function(){ dispatch({type: "Done"}) })
          }
        )

    case "Done":
  }
}
```


## Motivation

The existing redux-thunk middleware does not allow for returning both state and effects at the same time. This leads users to create artificial state events or try even more complex solutions for their effects.

The goal of this middleware is to maintain the simplicty and light-weight API of Redux when dealing with asynchronous actions.

This library attempts to directly copy how Effects are handled in Elm.


## code

``` js
function sideEffect(state: any, ...effects) {
  if (!state.meta) { state.meta = { sideEffects: effects } }
  return state
}

function sideEffectMiddleware({ dispatch, getState }) {
  return next => action => {
    var sideEffects = action && action.meta && action.meta.sideEffects
    var result = next(action);
    if (sideEffects) {
      sideEffects.forEach((effect) => effect(dispatch, getState))
    }
    return result
  }
}
```

Note that by default setTimeout is not called for you.
A function `sideEffectTimeout` is available which takes a time as a second parameter
and it wraps all side effects in setTimeout.


## dev tools replay

It should be easy enough to figure out how to enhance this to allow side effects to not be generated when replayed (but the events they previously dispatched would still show up).


## License

MIT
