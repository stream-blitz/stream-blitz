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

export const upsertCommand = async ({ channel, name, handler }) => {
  logger.debug(`upserting a new command for ${channel}`);
  const result = await graphql(
    `
      mutation(
        $channel: String!
        $name: String!
        $handler: String!
        $key: String!
      ) {
        upsert: insert_commands(
          objects: {
            channel: $channel
            name: $name
            handler: $handler
            key: $key
          }
          on_conflict: {
            constraint: commands_key_key
            update_columns: handler
            where: { key: { _eq: $key } }
          }
        ) {
          affected_rows
          returning {
            id
            name
            handler
            channel
            key
          }
        }
      }
    `,
    {
      channel,
      name,
      handler,
      key: `${channel}.${name}`,
    },
  );

  const command = result.data.upsert.returning[0];

  logger.debug(`command ${command.id} upserted`);

  return command;
};

export const runHandler = (handler, options) =>
  axios.post(handler, options).catch(error => {
    logger.error(error);
    res.status(500).send(error);
  });
