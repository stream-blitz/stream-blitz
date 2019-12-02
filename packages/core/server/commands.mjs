import axios from 'axios';
import getLogger from './logger.mjs';
import graphql from './graphql.mjs';

const logger = getLogger('commands');

export const getCommands = async ({ channel }) => {
  logger.debug('loading all commands...');
  const result = await graphql(
    `
      query($channel: String!) {
        commands(where: { channel: { _eq: $channel } }) {
          id
          name
          handler
        }
      }
    `,
    {
      channel,
    },
  );

  logger.debug(result);

  const { commands } = result.data;

  logger.debug('commands loaded', commands);

  return commands;
};

export const runHandler = (handler, options) =>
  axios.post(handler, options).catch(error => {
    logger.error(error);
    res.status(500).send(error);
  });
