import { Schema } from 'mongoose';

export { Schema };

export default ({
  name,
  schema,
  options = {},
  pre = {},
  post = {},
  plugins = [],
}) => (db) => {
  // create Schema
  const s = new Schema(schema, options);

  // Add pre middlewware
  for (const [k, v] of Object.entries(pre)) {
    s.pre(k, v.bind(s));
  }

  // Add post middleware
  for (const [k, v] of Object.entries(post)) {
    s.post(k, v.bind(s));
  }

  // Add plugins
  for (const plugin of plugins) {
    s.plugin(plugin);
  }

  // Attach to db instance
  return db.model.bind(db)(name, s);
};
