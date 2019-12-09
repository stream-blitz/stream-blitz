import comfy from 'comfy.js';
import graphql from './graphql.mjs';
import { getCommands, runHandler } from './commands.mjs';
import { sendMessage } from './socket.mjs';
import getLogger from './logger.mjs';

const logger = getLogger('chatbot');

let commands;

const init = async () => {
  // load the channels registered with the service
  const channelsResult = await graphql(
    `
      query {
        channels {
          name
        }
      }
    `,
  );

  const channels = channelsResult.data.channels.map(c => c.name);

  logger.debug('initializing the chatbot on the following channels:', channels);
  comfy.Init(process.env.TWITCH_BOT_USER, process.env.TWITCH_OAUTH, channels);
};

const handleChat = () => {
  // TODO how should this work?
  // here’s what it originally did — how do people register this kind of thing?
  // comfy.onChat = (_user, _message, _flags, _self, extra) => {
  //   const emotes = Object.keys(extra.messageEmotes || {}).map(id => ({
  //     id,
  //     count: extra.messageEmotes[id].length,
  //   }));
  //   if (emotes.length > 0) {
  //     sendMessage({
  //       type: 'chat',
  //       emotes,
  //       channel: extra.channel,
  //     });
  //   }
  // };
};

const handleCommands = () => {
  comfy.onCommand = async (user, command, message, flags, extra) => {
    // load the commands from memory if available or from the DB
    commands = commands || (await getCommands({ channel: extra.channel }));
    const cmd = commands.find(c => c.name === command);

    if (!cmd) return;

    const { handler } = cmd;

    if (!handler) return;

    const cmdResult = await runHandler(handler, {
      user,
      message,
      flags,
      extra,
    });

    const cmd = cmdResult.data;

    logger.debug({ command: cmd });

    sendMessage({ ...cmd, user });

    logger.debug('sending a message to the chat', {
      message: cmd.message,
      channel: cmd.channel,
    });

    comfy.Say(cmd.message, cmd.channel);
  };
};

export default async () => {
  init();
  handleChat();
  handleCommands();
};
