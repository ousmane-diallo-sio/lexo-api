import './extentions/index.js';
import express from 'express';
import bodyParser from 'body-parser';
import EnvConfig from './lib/config/EnvConfig.js';
import userController from './domain/user/Controller.js';
import childUserController from './domain/user/childUser/Controller.js';
import exerciseController from './domain/exercise/Controller.js';
import webhooks from './webhooks.js';
import mikroORMConfig from './db/mikro-orm.config.js';
import { authErrorHandler, requestLogger } from './lib/middlewares.js';
import { MikroORM } from '@mikro-orm/postgresql';
import path from 'path';
import { watchCommandFile } from './command-watcher.js';
import orm from './db/orm.js';
import cors from 'cors';

console.log('📀 Server starting');
const app = express();
console.log('⚙️  Initializing MikroORM...');

try {
  const mikroORM = await MikroORM.init(mikroORMConfig);
  orm.set(mikroORM);
  console.log('✅ MikroORM initialized');
} catch (error) {
  console.error(`Error during MikroORM initialization:\n`, error);
  process.exit(1);
}

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }));
app.use(requestLogger);

app.get('/', (req, res) => {
  res.contentType("application/json")
  res.send('Hello World!')
})

app.use('/public', express.static(path.join(__dirname, '../public')));
app.use("/users", userController);
app.use("/child-users", childUserController);
app.use("/exercises", exerciseController);
app.use("/webhooks", webhooks);

app.use(authErrorHandler);

app.listen(EnvConfig.PORT, async () => {
  console.log(`✅ Server running at http://${EnvConfig.HOST}:${EnvConfig.PORT}/`);
  console.log('---------------------------');
  await watchCommandFile();
});