/* eslint-disable consistent-return */
import EventEmmiter from 'events';
import createPublishEmitter from './creators/emitter';
import createHandler from './creators/handler';

const DEFAULT_DATA_LAYER = {
  // Ensure when a new client is connected we store their 
  // information for later publishing, or events
  saveClient: async (client) => {},

  // A client has disconnected so we can safely remove them
  removeClient: async (client) => {},

  // We want a client to subscribe to a specific event
  subscribe: async (client, event) => {},

  // We want a client to unsubscribe to a specific event
  unsubscribe: async (client, event) => {},

  // Get any subscribers for an event
  getSubscribers: async (event) => [],
};

export default (dataLayer = DEFAULT_DATA_LAYER) => {
  const ee = new EventEmmiter();
  const emitter = createPublishEmitter(dataLayer);

  return {
    on: ee.on.bind(ee),
    emit: async (type, payload) => emitter({ type, payload }),
    createHandler: () => createHandler(dataLayer, ee),
  };
};
