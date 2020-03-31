/* eslint-disable consistent-return */
import lambdaWs, { extractConnectionData } from '@teleology/lambda-wscore';
import { settle } from '../utils';

const PROTOCOL = {
  // Custom events
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',

  // AWS Events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
};

export default (dataLayer, ee) =>
  lambdaWs(async (event) => {
    const { action, data } = event;
    const client = { ...extractConnectionData(event), subscriptions: [] };

    try {
      if (action === PROTOCOL.CONNECT) {
        const listeners = ee.listeners(PROTOCOL.CONNECT);
        await settle(listeners.map((fn) => fn(event)));

        // only save the client if the connect callback did not fail
        await dataLayer.saveClient(client);
      }

      if (action === PROTOCOL.DISCONNECT) {
        // try to remove the client before the callback is called
        await dataLayer.removeClient(client);

        const listeners = ee.listeners(PROTOCOL.DISCONNECT);
        await settle(listeners.map((fn) => fn(event)));
      }

      if (action === PROTOCOL.MESSAGE) {
        const { op, type, payload } = data;
        if (op === PROTOCOL.SUBSCRIBE) {
          await dataLayer.subscribe(client, type);
          return;
        }

        if (op === PROTOCOL.UNSUBSCRIBE) {
          await dataLayer.unsubscribe(client, type);
          return;
        }

        if (!op) {
          const listeners = ee.listeners(type);
          await settle(listeners.map((fn) => fn(client, payload)));
        }
      }
    } catch (e) {
      console.error(e);
      await dataLayer.removeClient(client);
      return {
        statusCode: '500',
        body: JSON.stringify({
          message: e && e.message ? e.message : e,
        }),
      };
    }
  });
