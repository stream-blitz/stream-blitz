module.exports = sfxHandler => async event => {
  const { user, message, flags, extra } = JSON.parse(event.body);

  const response = sfxHandler({ user, message, flags, extra });

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
    },
    body: JSON.stringify(response),
  };
};
