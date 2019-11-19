const ReactDispatcher = require('flux-react-dispatcher');

const Dispatcher = Object.assign(new ReactDispatcher(), {
  handleViewAction(action) {
    const that = this;

    const payload = {
      source: 'VIEW_ACTION',
      action,
    };

    API.log(payload.action.actionType, payload.action);

    that.dispatch(payload);
  },
});

export default Dispatcher;
window.Dispatcher = Dispatcher;
