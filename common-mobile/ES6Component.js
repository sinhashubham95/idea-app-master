/* eslint-disable no-param-reassign, func-names */


const ES6Component = function (context, onUnmount) {
  context._listeners = [];

  context.listenTo = function (store, event, callback) {
    this._listeners.push({
      store,
      event,
      callback,
    });
    store.on(event, callback);
    return this._listeners.length;
  };

  context.stopListening = function (index) {
    const listener = this._listeners[index];
    listener.store.off(listener.event, listener.callback);
  };

  context.componentWillUnmount = function () {
    _.each(this._listeners, (listener, index) => {
      if (listener) {
        this.stopListening(index);
      }
    });
    if (onUnmount) {
      onUnmount();
    }
  };
};

window.ES6Component = ES6Component;

export default ES6Component;