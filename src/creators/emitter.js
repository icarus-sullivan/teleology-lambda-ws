import { createPublisher } from '@teleology/lambda-wscore';
import { settle } from '../utils';

const emitOne = async (client, type, payload) =>
  createPublisher(client)({ type, payload });

export default (dataLayer) => async ({ type, payload }) => {
  const clients = await dataLayer.getSubscribers(type);
  await settle(clients.map((client) => emitOne(client, type, payload)));
};
