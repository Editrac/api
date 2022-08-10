import mongoose from 'mongoose';
import util from 'util';
import bluebird from 'bluebird';
import { config } from './config';
import logger from './winston';

const debug = require('debug')('mongo');

// plugin bluebird promise in mongoose
mongoose.Promise = bluebird;

export const createMongoConnection = async () => {
  try {
    // connect to mongo db
    const mongoUri = config.mongoUri;
    await mongoose.connect(mongoUri, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    for (let index = 0; index < mongoose.modelNames().length; index++) {
      const model = mongoose.modelNames()[index];
      await mongoose.model(model).createIndexes();
    }
    logger.info('Connected to db');
  } catch (error) {
    throw error;
  }
}

// print mongoose logs in dev env
if (config.mongooseDebug) {
  mongoose.set('debug', (collectionName: any, method: any, query: any, doc: any) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}
