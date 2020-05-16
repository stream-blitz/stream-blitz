const tmi = require('tmi.js');
const {
  parseAuthor,
  parseCommand,
  parseEmotes,
  getMessageHTML,
} = require('./util/parse-twitch-chat');

exports.createChatBot = pubsub => {
  const client = new tmi.Client({
    connection: {
      secure: true,
      reconnect: true,
    },
    identity: {
      username: process.env.TWITCH_BOT_USER,
      password: process.env.TWITCH_OAUTH,
    },
    channels: ['jlengstorf'],
  });

  client.connect();

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
    };

    if (msg.startsWith('!')) {
      // TODO check if this command is in a cooldown period before sending
      const { command, arguments } = parseCommand(msg);

      message.command = command;
      message.arguments = arguments;
    } else {
      message.html = getMessageHTML(msg, message.emotes);
    }

    pubsub.publish('MESSAGE', { message });
  });
};
