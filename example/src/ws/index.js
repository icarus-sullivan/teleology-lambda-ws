import ws from '@teleology/lambda-ws';
import mongo from '../mongo';

const mongoCaller = mongo({});

const saveClient = async (client) => {
  await mongoCaller(async ({ models }) => {
    return models.client
      .findOneAndUpdate({ connectionId: client.connectionId }, client, {
        upsert: true,
        lean: true,
      })
      .exec();
  });
};

const subscribe = async (client, event) => {
  await mongoCaller(async ({ models }) => {
    return models.client
      .findOneAndUpdate(
        { connectionId: client.connectionId },
        {
          $addToSet: {
            subscriptions: event,
          },
        },
      )
      .lean()
      .exec();
  });
};
const unsubscribe = async (client, event) => {
  // do nothing
};
const removeClient = async (client) => {
  await mongoCaller(async ({ models }) => {
    return models.client
      .findOneAndRemove({ connectionId: client.connectionId })
      .lean()
      .exec();
  });
};
const getSubscribers = async (event) => {
  return mongoCaller(async ({ models }) => {
    return models.client
      .find({ subscriptions: { $in: [event] } })
      .lean()
      .exec();
  });
};

export default ws({
  saveClient,
  removeClient,
  subscribe,
  unsubscribe,
  getSubscribers,
});
