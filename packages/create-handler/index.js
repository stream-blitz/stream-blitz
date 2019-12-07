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

  const { user, message, flags, extra } = JSON.parse(event.body);

  const response = sfxHandler({ user, message, flags, extra });

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(response),
  };
};
