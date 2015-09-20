import chai from 'chai';
import {mkSideEffect} from '../src/index';

describe('side effect middleware', () => {
  const doDispatch = () => {};
  var mutated = 0
  const effect = function(){ mutated++ }
  const doGetState = () => {}
  var listener = null
  var eff = mkSideEffect()
  const nextHandler = eff.sideEffectMiddleware(
      { dispatch: doDispatch
      , getState: doGetState
      , subscribe: function(f){
          listener = f;
        }
      });

  it('must return a function to handle next', () => {
    chai.assert.isFunction(nextHandler);
    chai.assert.strictEqual(nextHandler.length, 1);
  });

  describe('handle next', () => {
    it('must return a function to handle action', () => {
      const actionHandler = nextHandler();

      chai.assert.isFunction(actionHandler);
      chai.assert.strictEqual(actionHandler.length, 1);
    });

    describe('handle action', () => {
      it('must run the given effects with dispatch and getState', done => {
        const actionObj = {}
        const actionHandler = nextHandler(action => {
          chai.assert.strictEqual(action, actionObj);
        });

        eff.sideEffect(effect);
        actionHandler(actionObj);
        listener();
        chai.assert.strictEqual(mutated, 1);
        done()
      });

      it('must pass action to next if no meta', done => {
        const actionObj = {};

        const actionHandler = nextHandler(action => {
          chai.assert.strictEqual(action, actionObj);
          done();
        });

        actionHandler(actionObj);
      });

      it('must pass action to next if no meta effects', done => {
        const actionObj = {meta: {}};

        const actionHandler = nextHandler(action => {
          chai.assert.strictEqual(action, actionObj);
          done();
        });

        actionHandler(actionObj);
      });

      it('must return the return value of next when no effects', () => {
        const expected = 'redux';
        const actionHandler = nextHandler(() => expected);

        let outcome = actionHandler();
        chai.assert.strictEqual(outcome, expected);
      });
    });
  });

  describe('handle errors', () => {
    it('must throw if argument is non-object', done => {
      try {
        sideEffectMiddleware();
      } catch(err) {
        done();
      }
    });
  });
});
