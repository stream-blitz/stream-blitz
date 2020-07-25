const pkg = require('./package.json');

function allowCORS() {
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

module.exports = ({ name, description, handler }) => async event => {
  if (event.httpMethod === 'OPTIONS') {
    return allowCORS();
  }

  const { message, command, arguments, author, extra } = JSON.parse(event.body);

  const response = handler({ message, command, arguments, author, extra });

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
