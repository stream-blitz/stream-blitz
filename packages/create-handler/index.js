const pkg = require('./package.json');

module.exports = sfxHandler => async event => {
  if (event.httpMethod === 'OPTIONS') {
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

  const { message, command, arguments, author, extra } = JSON.parse(event.body);

  const response = sfxHandler({ message, command, arguments, author, extra });

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'X-Stream-Blitz-Handler-Version': pkg.version,
    },
    body: JSON.stringify({ ...response, channel: extra.channel }),
  };
};
