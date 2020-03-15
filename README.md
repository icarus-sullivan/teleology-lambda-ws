# @teleology/lambda-ws
![Downloads][link-download] ![Version][link-version] ![License][link-license]

#### A Serverless >=  1.38 Lambda Websocket wrapper. Auto parses data, injects a publish method as well as a quick eventType reference. 

## Installation

```sh
npm install @teleology/lambda-ws
```
or
```sh
yarn add @teleology/lambda-ws
```

## Usage

### Servereless Project

Configure your function to accept all routes/actions. 

```
functions:
  websocket:
    handler: src/index.default
    memorySize: 3008
    events:
      - websocket:
          route: $connect
      - websocket:
          route: $disconnect
      - websocket:
          route: $default
```

### Wrapper
Be aware, you do not need to return anything within the lambda, the library will automatically return a valid response. However for a custom response your handler should return a JSON object with a statusCode. 

```javascript
// pre-ES6
// const lambdaWs = require('@teleology/lambda-ws');

// ES6
import lambdaWs from '@teleology/lambda-ws';

const actionMap = {
  connect: async (event) => {},
  disconnect: async (event) => {},
  message: async ({ data, publish }) => {
    // console log - echo back data
    console.log('received', data);
    await publish(data);
  },
};

export default lambdaWs(async (event) => {
  const { action } = event;

  const actionHandler = actionMap[action];
  if (actionHandler) {
    return actionHandler(event);
  }
});
```

### Connection Details

Connection data is needed to re-establish a publish request and can be used outside of the context of the lambda (as long as the connection is still open).

```javascript
import lambdaWs, { extractConnectionData } from '@teleology/lambda-ws';

export default lambdaWs(async (event) => {
  // Save connectionData for use later
  const connectionData = extractConnectionData(event);
})
```

### Connection Details

If you have stored your connection details somewhere else, you can publish data to a client outside of the websocket lambda.

```javascript
import { createPublisher } from '@teleology/lambda-ws';

const publishToClient = async (connectionData, message) => {
  const publish = createPublisher(connectionData);

  return publish(message);
}
```

### EnhancedEvent 
```
type Publisher = Function(data: any);

type EnhancedEvent & OriginalEvent {
  action: connect | disconnect | message
  publish: Publisher
  data: JSON | Buffer | string
}
```

[link-download]: https://img.shields.io/npm/dt/@teleology/lambda-ws.svg
[link-version]: https://img.shields.io/npm/v/@teleology/lambda-ws.svg
[link-license]: https://img.shields.io/npm/l/@teleology/lambda-ws.svg