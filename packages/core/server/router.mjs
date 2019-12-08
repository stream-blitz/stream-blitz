import { join } from 'path';
import express from 'express';
import cors from 'cors';
import auth from './auth.mjs';
import getLogger from './logger.mjs';
import { sendMessage } from './socket.mjs';
import { getCommands, runHandler } from './commands.mjs';
import { upsertCommand } from './commands.mjs';

const logger = getLogger('router');

logger.debug('initializing router...');

const app = express();

// serve the overlay as static files
app.use(express.json());
app.use(express.static(join(process.cwd(), 'client')));

app.use(cors());

// handle incoming command requests
app.post('/commands/trigger', auth, async (req, res) => {
  const msg = req.body;
  const commands = await getCommands({ channel: msg.channel });
  const command = commands.find(cmd => cmd.name === msg.command);

  if (!command) res.status(404).send(`command “${msg.command}” not found`);

  logger.debug('sending request to handler', command.handler);

  const result = await runHandler(command.handler, {
    user: msg.user,
    message: null,
    flags: {},
    extra: { channel: msg.channel },
  });

  logger.debug({ command: result.data });

  sendMessage({ ...result.data, user: msg.user });

  res.send('ok');
});

app.post('/commands/create', auth, async (req, res) => {
  const { channel, name, handler } = req.body;
  const command = await upsertCommand({ channel, name, handler });

  res.json(command);
});

app.post('/commands/list', auth, async (req, res) => {
  const { channel } = req.body;
  const commands = await getCommands({ channel });

  res.json(commands);
});

export default app;
