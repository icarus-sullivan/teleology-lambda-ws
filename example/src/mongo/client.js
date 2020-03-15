import model, { Schema } from './model';

export default model({
  name: 'client',
  schema: {
    connectionId: { type: String, index: true },
    domainName: { type: String },
    stage: { type: String },
    subscriptions: { type: Array },
  },
  options: {
    timestamps: { createdAt: 'created', updatedAt: 'updated' },
  },
});
