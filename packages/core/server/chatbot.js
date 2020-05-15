const tmi = require('tmi.js');

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

  client.on('message', (_, tags, message, self) => {
    if (self) return;
    let emotes = null;

    const emoteObj = tags['emotes'];

    if (emoteObj) {
      emotes = Object.keys(emoteObj).reduce((arr, emoteCode) => {
        const instances = emoteObj[emoteCode];

        const codesWithStartEnd = instances.map(instance => {
          const [start, end] = instance.split('-');
          return [emoteCode, start, end];
        });

        return [...arr, ...codesWithStartEnd];
      }, []);
    }

    const response = {
      emotes,
      message,
      displayName: tags['display-name'],
      color: tags['color'],
    };

    pubsub.publish('CHAT', { chat: response });
  });
};
