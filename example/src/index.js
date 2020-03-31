import ws from './ws';

ws.on('connect', (event) => {
  console.log('connect', event);
});

ws.on('disconnect', (event) => {
  console.log('disconnect', event);
});

ws.on('greet', async (client, msg) => {
  console.log('greet', msg);

  return ws.emit('greet', msg);
});

export default ws.createHandler();
