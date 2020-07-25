const pkg = require('./package.json');

type Role = 'SUBSCRIBER' | 'MODERATOR' | 'BROADCASTER';

interface Author {
  id: string;
  username: string;
  roles: Role[];
}

interface Command {
  message: string;
  command: string;
  arguments?: string[];
  author: Author;
  extra: { channel: string };
}

interface Effect {
  message?: string;
  audio?: string;
  image?: string;
  duration?: number;
}

interface Handler {
  (command: Command): Effect;
}

interface EffectDefinition {
  name: string;
  description?: string;
  handler: Handler;
}

interface ServerlessResponse {
  statusCode: number;
  headers: object | null;
  body: string;
}

interface ServerlessHandler {
  (event: any): Promise<ServerlessResponse>;
}

module.exports = ({
  name,
  description,
  handler,
}: EffectDefinition): ServerlessHandler => async event => {
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

  const response = handler({
    message,
    command,
    arguments: args,
    author,
    extra,
  });

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
