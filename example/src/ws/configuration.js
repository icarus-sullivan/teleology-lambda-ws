import mongo from '../mongo';

const mongoCaller = mongo({});

export const saveClient = async (client) => {
  await mongoCaller(async ({ models }) => {
    return models.client
      .findOneAndUpdate({ connectionId: client.connectionId }, client, {
        upsert: true,
        lean: true,
      })
      .exec();
  });
};
export const subscribe = async (client, event) => {
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
export const unsubscribe = async (client, event) => {
  // do nothing
};
export const removeClient = async (client) => {
  await mongoCaller(async ({ models }) => {
    return models.client
      .findOneAndRemove({ connectionId: client.connectionId })
      .lean()
      .exec();
  });
};
export const getSubscribers = async (event) => {
  return mongoCaller(async ({ models }) => {
    return models.client
      .find({ subscriptions: { $in: [event] } })
      .lean()
      .exec();
  });
};
