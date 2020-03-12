import comfy from 'comfy.js';
import { getCommands, runHandler } from './commands.mjs';
import { sendMessage } from './socket.mjs';
import getLogger from './logger.mjs';

const logger = getLogger('chatbot');

let ACTIVE_CHANNELS = new Set();
let COMMANDS;

const init = async channel => {
  logger.debug('initializing the chatbot for @', channel);
  comfy.Init(process.env.TWITCH_BOT_USER, process.env.TWITCH_OAUTH, [channel]);
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
    COMMANDS = await getCommands({ channel: extra.channel });
    const currentCommand = COMMANDS.find(c => c.command === command);

    if (!currentCommand) return;

    const { handler } = currentCommand;

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

export default async channel => {
  // only initialize the chatbot once per channel
  if (!channel || ACTIVE_CHANNELS.has(channel)) return;

  ACTIVE_CHANNELS.add(channel);

  init(channel);
  handleChat();
  handleCommands();
};
