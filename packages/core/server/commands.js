const fetch = require('node-fetch');

async function getCommandsForChannel(channel) {
  const { effects } = await fetch(process.env.HASURA_GRAPHQL_URI, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Hasura-Admin-Secret': process.env.HASURA_ADMIN_SECRET,
      'X-Hasura-Role': 'overlay',
      'X-Hasura-Channel': channel,
    },
    body: JSON.stringify({
      query: `
        query {
          effects {
            command
            handler
          }
        }
      `,
    }),
  })
    .then(res => res.json())
    .then(res => res.data)
    .catch(err => console.error(err));

  return effects;
}

exports.getCommands = async channel => {
  const commands = await getCommandsForChannel(channel);

  return commands.map(({ command }) => `!${command}`);
};

exports.getCommand = async ({
  channel,
  author,
  command,
  arguments,
  message: originalChatMessage,
}) => {
  const commands = await getCommandsForChannel(channel);
  const cmd = commands.find(c => c.command === command);

  if (!cmd) {
    return null;
  }

  try {
    const {
      name,
      message,
      description,
      audio,
      image,
      duration = 4,
    } = await fetch(cmd.handler, {
      method: 'POST',
      body: JSON.stringify({
        message: originalChatMessage,
        command,
        arguments,
        author,
        extra: {
          channel,
        },
      }),
    })
      .then(res => res.json())
      .catch(err => {
        throw new Error(err.message);
      });

    return {
      name,
      message,
      description,
      audio,
      image,
      duration,
    };
  } catch (error) {
    return null;
  }
};
