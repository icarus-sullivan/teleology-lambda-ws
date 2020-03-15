import ws from '@teleology/lambda-ws';

import * as configuration from './ws/configuration';

ws.configure(configuration);

ws.on('connect', (event) => {
  console.log('connect', event);
  // throw new Error('no');
});

ws.on('disconnect', (event) => {
  console.log('disconnect', event);
});

ws.on('greet', async (client, msg) => {
  console.log('greet', msg);

  return ws.emit('greet', msg);
});

export default ws.createHandler();
