require('dotenv').config({ path: `${__dirname}/.env` });
const axios = require('axios');

exports.handler = async event => {
  const { id } = JSON.parse(event.body);
  const result = await axios.get(
    `https://stream-blitz.auth0.com/api/v2/users/${id}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`,
      },
    },
  );

  if (result.errors) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }

  const user = result.data;

  const twitchIdentity = user.identities.find(
    identity => identity.connection === 'twitch',
  );

  return {
    statusCode: 200,
    body: JSON.stringify(twitchIdentity.access_token),
  };
};
