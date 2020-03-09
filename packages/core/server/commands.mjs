import axios from 'axios';
import getLogger from './logger.mjs';

const logger = getLogger('commands');

export const getCommands = async ({ channel }) => {
  logger.debug('loading all commands...');
  const result = await axios
    .post(
      process.env.HASURA_GRAPHQL_URI,
      {
        query: `
          query {
            effects {
              command
              handler
            }
          }
        `,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Hasura-Admin-Secret': process.env.HASURA_ADMIN_SECRET,

          // use an unauthenticated role and filter by the current channel
          'X-Hasura-Role': 'overlay',
          'X-Hasura-Channel': channel,
        },
      },
    )
    .then(response => response.data)
    .catch(error => logger.error(error));

  const { effects } = result.data;

  logger.debug('commands loaded', effects);

  return effects;
};

export const runHandler = (handler, options) =>
  axios.post(handler, options).catch(error => {
    logger.error(error);
    res.status(500).send(error);
  });
