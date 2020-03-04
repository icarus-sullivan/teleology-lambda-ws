import EventEmmiter from 'events';

const clients = {};

const events = new EventEmmiter();

// const protocol = {
//   saveClient: (client) => {},
//   removeClient: (client) => {},
//   restoreClient: (client) => {},
//   restoreClientsFor: (event) => {},
//   on: (event, d) => {},
//   emit: (event, d) => {},
// }

events.on('test', (d) => {
  console.log('clients', clients);
  console.log('test data', d);
  const c = Object.values(clients);
  const publishers = c.map(createPublisher);
  Promise.all(publishers.map((fn) => fn({ type: 'test', payload: d })));
});