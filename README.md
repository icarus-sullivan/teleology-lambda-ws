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

##### Servereless Project

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

##### Usage

```javascript
// pre-ES6
// const lambdaWs = require('@teleology/lambda-ws');

// ES6
import lambdaWs from '@teleology/lambda-ws';

const handler = async (enhancedEvent) => {
  const { action, connectionId } = enhancedEvent.requestContext;
  switch (action) {
    case 'connect': {
      const token = enhancedEvent.headers.Authorization.replace('Bearer ', '');
      // handle authorization - throw if Unauthorized
      break;
    }
    case 'disconnect': {
      console.log('Closing connection to', connectionId);
      break;
    }
    case 'message': {
      const { publish } = enhancedEvent;
      await publish({ message: 'hello from @teleology/lambda-ws' });
      break;
    }
    default: {
      // no-op
      break;
    }
  }
};

export default lambdaWs(handler);
```
Be aware, you do not need to return anything within the lambda, the library will automatically return a valid response. However for a custom response your handler should return a JSON object with a statusCode. 


#### EnhancedEvent 
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