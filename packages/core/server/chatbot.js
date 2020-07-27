const tmi = require('tmi.js');
const {
  parseAuthor,
  parseCommand,
  parseEmotes,
  getMessageHTML,
} = require('./util/parse-twitch-chat');

let CHAT_CLIENT;
function getChatClient(channels = ['jlengstorf']) {
  if (!CHAT_CLIENT) {
    CHAT_CLIENT =
      CHAT_CLIENT ||
      new tmi.Client({
        connection: {
          secure: true,
          reconnect: true,
        },
        identity: {
          username: process.env.TWITCH_BOT_USER,
          password: process.env.TWITCH_OAUTH,
        },
        channels,
      });

    CHAT_CLIENT.connect();
  }

  return CHAT_CLIENT;
}

exports.createChatBot = pubsub => {
  // TODO how do we listen to multiple names?
  const client = getChatClient();

  client.on('subscription', (channel, username, method, message, meta) => {
    // TODO handle subscriptions
    // https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#subscription
  });

  client.on('resub', (channel, username, months, message, meta, methods) => {
    // TODO handle resubs
    // https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#resub
  });

  // TODO handle gift subs
  // https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#subgift
  // https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#anongiftpaidupgrade
  // https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#giftpaidupgrade

  // TODO handle bits
  // https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#cheer

  // TODO handle raids
  // https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md#raided

  client.on('message', (channel, meta, msg, self) => {
    // don’t process messages sent by the chatbot to avoid loops
    if (self) return;

    if (meta['message-type'] === 'whisper') {
      // we don’t handle whispers
      return;
    }

    // chat activity always includes author and emote data
    const message = {
      channel: channel.replace('#', ''),
      message: msg,
      author: parseAuthor(channel, meta),
      emotes: parseEmotes(msg, meta.emotes),
      time: new Date(parseInt(meta['tmi-sent-ts'])),
      id: meta.id,
    };

    if (msg.startsWith('!')) {
      // TODO check if this command is in a cooldown period before sending
      const { command, args } = parseCommand(msg);

      message.command = command;
      message.args = args;
    } else {
      message.html = getMessageHTML(msg, message.emotes);
    }

    pubsub.publish('MESSAGE', { message });
  });
};

exports.sendMessage = ({ channel, message }) => {
  if (!channel || !message) return;

  const client = getChatClient();

  client.say(channel, message);
};
