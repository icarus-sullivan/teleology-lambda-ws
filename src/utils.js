/* eslint-disable no-nested-ternary */
const thennable = (v) => v && v.then && typeof v.then === 'function';

const settleOne = (promise) =>
  thennable(promise)
    ? promise.then(
        (x) => ({ success: true, value: x }),
        (e) => ({ success: false, value: e }),
      )
    : typeof promise === 'function'
    ? promise()
    : promise;

export const settle = (promises) => Promise.all(promises.map(settleOne));
