import https from 'https';
import aws4 from 'aws4';

const request = (options) =>
  new Promise((resolve) => {
    const req = https.request(options, ({ statusCode }) => {
      resolve(statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.write(options.body);
    req.end();
  });

const detectHeader = (data) =>
  data && data instanceof Buffer
    ? { 'Content-Type': 'application/octet-stream' }
    : { 'Content-Type': 'application/json' };

const sanitizeBody = (data) =>
  data && data instanceof Buffer ? data : JSON.stringify(data);

export const createPublisher = ({ stage, domainName, connectionId }) => (
  data,
) =>
  request(
    aws4.sign({
      path: `/${stage}/%40connections/${encodeURIComponent(connectionId)}`,
      headers: detectHeader(data),
      body: sanitizeBody(data),
      host: domainName,
      method: 'POST',
    }),
  );

const extractData = ({ isBase64Encoded = false, body = '{}' }) => {
  try {
    const debuff = Buffer.from(body, isBase64Encoded ? 'base64' : undefined);
    const o = JSON.parse(debuff);
    if (o && typeof o === 'object') {
      return {
        data: o,
      };
    }
  } catch (e) {
    // do nothing
  }

  return {
    data: body,
  };
};

export default (fn) => async (event) => {
  const action = event.requestContext.eventType.toLowerCase();
  const enhancedEvent = {
    ...event,
    ...extractData(event),
    publish: createPublisher(event.requestContext),
    action,
  };

  if (action !== 'message') {
    delete enhancedEvent.publish;
  }

  const response = await fn(enhancedEvent);
  return (
    response || {
      statusCode: '200',
    }
  );
};
