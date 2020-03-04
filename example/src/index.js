import lambdaWs, { extractConnectionData } from '@teleology/lambda-ws';

const connect = async (event) => {
  // Save connection data to db for later publishing
  const connectionData = extractConnectionData(event);
};

const disconnect = async (event) => {
  // Remove connection in db
  const connectionData = extractConnectionData(event);
};

const message = async ({ data, publish }) => {
  // console log - echo back data
  console.log('received', data);
  await publish(data);
};

const actionMap = {
  connect,
  disconnect,
  message,
};

export default lambdaWs(async (event) => {
  const { action } = event;

  const actionHandler = actionMap[action];
  if (actionHandler) {
    return actionHandler(event);
  }
});
