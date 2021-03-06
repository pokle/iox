/* @flow */
/* ::
  type Action = string;
  type IO = { io: Action, then?: Function };
  type Actions = { [Action]: (any) => any };
*/

function isIO(value) {
  return Boolean(
    value != null &&
      typeof value === 'object' &&
      typeof value.io === 'string' &&
      (!value.then || typeof value.then === 'function')
  );
}

function run_(actions, io) {
  // Execute the IO action
  const action = actions[io.io];
  if (action == null)
    return Promise.reject(new Error('Unknown io action: ' + io.io));

  try {
    return Promise.resolve(action(io)).then(result => {
      // Call the callback with the result of the action
      const nextIO = io.then ? io.then(result) : result;

      // Work out what's next
      if (isIO(nextIO)) {
        return run_(actions, nextIO); // Process more IO
      } else {
        return nextIO; // final result
      }
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

module.exports = {
  run: function(actions /*:Actions*/, io /*:IO*/) /*:Promise<*>*/ {
    if (!actions) {
      throw new Error('ioperator.run called without actions');
    }

    if (!isIO(io)) {
      throw new Error(
        'ioperator.run called with a non io-action: ' + String(io)
      );
    }

    return run_(actions, io);
  }
};
