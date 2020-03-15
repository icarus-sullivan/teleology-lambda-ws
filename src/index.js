/* eslint-disable consistent-return */
import EventEmmiter from 'events';
import { settle } from './utils';
import lambdaWs, { extractConnectionData, createPublisher } from './core';

const E = new EventEmmiter();

const OP_CODES = {
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
};

const AWS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
};

const PROTOCOL = {
  ...OP_CODES,
  ...AWS_EVENTS,
};

let configuration = {
  // client operations
  saveClient: async (client) => {},
  removeClient: async (client) => {},

  // subscriptions
  subscribe: async (client, event) => {},
  unsubscribe: async (client, event) => {},
  getSubscribers: async (event) => [],
};

const configure = (options) => {
  configuration = {
    ...configuration,
    ...options,
  };
};

const emitOne = async (client, type, payload) =>
  createPublisher(client)({ type, payload });

const emitImpl = async ({ type, payload }) => {
  const clients = await configuration.getSubscribers(type);
  await settle(clients.map((client) => emitOne(client, type, payload)));
};

const emit = async (type, payload) => emitImpl({ type, payload });

const on = E.on.bind(E);

const createHandler = () =>
  lambdaWs(async (event) => {
    const { action, data } = event;
    const client = { ...extractConnectionData(event), subscriptions: [] };

    try {
      if (action === PROTOCOL.CONNECT) {
        const listeners = E.listeners(PROTOCOL.CONNECT);
        await settle(listeners.map((fn) => fn(event)));

        // only save the client if the connect callback did not fail
        await configuration.saveClient(client);
      }

      if (action === PROTOCOL.DISCONNECT) {
        // try to remove the client before the callback is called
        await configuration.removeClient(client);

        const listeners = E.listeners(PROTOCOL.DISCONNECT);
        await settle(listeners.map((fn) => fn(event)));
      }

      if (action === PROTOCOL.MESSAGE) {
        const { op, type, payload } = data;
        if (op === PROTOCOL.SUBSCRIBE) {
          await configuration.subscribe(client, type);
          return;
        }

        if (op === PROTOCOL.UNSUBSCRIBE) {
          await configuration.unsubscribe(client, type);
          return;
        }

        if (!op) {
          const listeners = E.listeners(type);
          await settle(listeners.map((fn) => fn(client, payload)));
        }
      }
    } catch (e) {
      console.error(e);
      await configuration.removeClient(client);
      return {
        statusCode: '500',
        body: JSON.stringify({
          message: e && e.message ? e.message : e,
        }),
      };
    }
  });

module.exports = {
  on,
  emit,
  configure,
  createHandler,
};
