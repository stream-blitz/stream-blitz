const pkg = require('./package.json');

type Role = 'SUBSCRIBER' | 'MODERATOR' | 'BROADCASTER';

interface Author {
  id: string;
  username: string;
  roles: Role[];
}

interface Effect {
  message?: string;
  audio?: string;
  image?: string;
  duration?: number;
}

interface EffectDefinition {
  name: string;
  description?: string;
  handler: (commandData: {
    message: string;
    command: string;
    arguments: string[];
    author: Author;
    extra: { channel: string };
  }) => Effect;
}

function createHandler({ name, description, handler }: EffectDefinition) {
  return async event => {
    if (event.httpMethod === 'OPTIONS') {
      // allow CORS
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify('ok'),
      };
    }

    const { message, command, arguments: args, author, extra } = JSON.parse(
      event.body,
    );

    console.log({
      name,
      description,
      handler,
      message,
      command,
      arguments: args,
      author,
      extra,
    });

    let response;
    try {
      response = handler({
        message,
        command,
        arguments: args,
        author,
        extra,
      });
    } catch (error) {
      /*
       * Some effects have custom logic and return early, which means this
       * destructuring might fail. We don’t want to actually fail the function,
       * though, so we can just return an empty response, which effectively
       * noops the effect without breaking anything.
       */
      response = {};
    }

    console.log({ response });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'X-Stream-Blitz-Handler-Version': pkg.version,
      },
      body: JSON.stringify({
        name,
        description,
        ...response,
        channel: extra.channel,
      }),
    };
  };
}

module.exports = createHandler;
