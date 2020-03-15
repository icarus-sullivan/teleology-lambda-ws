import mongoose, { disconnect } from 'mongoose';

import client from './client';

const schemas = [client];

export default ({ uri = process.env.MONGO_URI }) => async (fn) => {
  try {
    const con = mongoose.createConnection(uri);

    for (const schema of schemas) {
      schema(con);
    }

    const response = await fn(con);
    disconnect();
    return response;
  } catch (e) {
    disconnect();
  }
};
