import chai from 'chai';
import {sideEffect, sideEffectMiddleware} from '../src/index';

describe('side effect middleware', () => {
  const doDispatch = () => {};
  const doGetState = () => {};
  const nextHandler = sideEffectMiddleware({dispatch: doDispatch, getState: doGetState});

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
        var mutated = 0
        const effect = function(){ mutated++ }
        const actionObj = { meta: { sideEffects: [effect] } };

        const actionHandler = nextHandler(action => {
          chai.assert.strictEqual(action, actionObj);
          done()
        });

        actionHandler(actionObj);
        chai.assert.strictEqual(mutated, 1);
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
