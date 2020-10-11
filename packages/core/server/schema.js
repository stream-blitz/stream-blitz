const LRU = require('lru-cache');
const fetch = require('node-fetch');
const { getTwitchAccessToken } = require('@jlengstorf/get-twitch-oauth');
const { gql } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { withFilter } = require('graphql-subscriptions');
const beeline = require('honeycomb-beeline')();
const { getCommand, getCommands } = require('./commands');
const { sendMessage, createChatBot } = require('./chatbot');
const { logger } = require('./logger');

const recentMessages = new LRU(50);

exports.typeDefs = gql`
  scalar Date

  type Query {
    channel(username: String!): TwitchChannel!
    commands(username: String!): [String!]!
  }

  enum TwitchChannelStatus {
    LIVE
    OFFLINE
  }

  type TwitchChannel {
    id: ID!
    username: String!
    description: String!
    status: TwitchChannelStatus!
    stream: TwitchStream
  }

  type TwitchStream {
    id: ID!
    title: String!
    startTime: Date!
  }

  type Subscription {
    message(channel: String!): TwitchMessage!
  }

  interface TwitchMessage {
    id: ID!
    message: String!
    author: TwitchChatAuthor!
    emotes: [TwitchEmote!]!
    time: Date!
  }

  type TwitchChatMessage implements TwitchMessage {
    id: ID!
    html: String!
    message: String!
    author: TwitchChatAuthor!
    emotes: [TwitchEmote!]!
    time: Date!
  }

  type TwitchChatCommand implements TwitchMessage {
    id: ID!
    command: String!
    args: [String!]!
    message: String!
    author: TwitchChatAuthor!
    emotes: [TwitchEmote!]!
    handler: StreamBlitzCommand
    time: Date!
  }

  type TwitchEmote {
    id: ID!
    name: String!
    locations: [[Int!]!]!
    images: TwitchEmoteImages!
  }

  type TwitchEmoteImages {
    small: String!
    medium: String!
    large: String!
  }

  enum TwitchChannelRoles {
    BROADCASTER
    MODERATOR
    SUBSCRIBER
  }

  type TwitchChatAuthor {
    username: String!
    roles: [TwitchChannelRoles!]!
  }

  type StreamBlitzCommand {
    name: String!
    message: String
    description: String
    audio: String
    image: String
    duration: Int!
  }
`;

exports.createResolvers = pubsub => {
  return {
    Date: new GraphQLScalarType({
      name: 'Date',
      description: 'A Date object',
      parseValue(value) {
        return new Date(value);
      },
      serialize(value) {
        return value.getTime();
      },
      parseLiteral(ast) {
        return ast.kind === Kind.INT ? new Date(+ast.value) : null;
      },
    }),
    Query: {
      channel: async function channel(_, { username }) {
        beeline.addContext({ twitchUsername: username });
        const twitchResult = await getTwitchAccessToken({
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
        });

        const { access_token } = twitchResult;

        try {
          const [[user], [stream]] = await Promise.all([
            fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${access_token}`,
                'Client-ID': process.env.TWITCH_CLIENT_ID,
              },
            })
              .then(res => res.json())
              .then(res => res.data)
              .catch(err => console.error(err)),
            fetch(
              `https://api.twitch.tv/helix/streams?user_login=${username}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  'Client-ID': process.env.TWITCH_CLIENT_ID,
                },
              },
            )
              .then(res => res.json())
              .then(res => res.data)
              .catch(err => console.error(err)),
          ]);

          return {
            id: user.id,
            username: user.login,
            description: user.description,
            status: stream?.type === 'live' ? 'LIVE' : 'OFFLINE',
            stream: stream
              ? {
                  id: stream.id,
                  title: stream.title,
                  startTime: new Date(stream.started_at),
                }
              : null,
          };
        } catch (error) {
          console.error(error.message);
          console.trace(error);
        }
      },
      commands: (_, { username }) => {
        return getCommands(username);
      },
    },
    Subscription: {
      message: {
        // filter by connected channel
        // https://www.apollographql.com/docs/graphql-subscriptions/setup/#filter-subscriptions
        subscribe: withFilter(
          (_, variables) => {
            /*
             * this is called once per subscription (e.g. each time a GraphQL
             * client loads and fires of a subscription query)
             *
             * we need to know which channel to subscribe to (using the
             * variables) before we can create the chatbot, but we don’t want to
             * create a new chatbot on every message, so this is pretty much the
             * only place where we can create it once per connection
             */
            const { channel } = variables;
            createChatBot(pubsub, channel);

            return pubsub.asyncIterator(['MESSAGE']);
          },
          (payload, variables) => {
            // bail if this message is for a different channel
            if (payload.message.channel !== variables.channel) {
              return false;
            }

            // bail if this message has already been sent
            logger.debug({
              message: payload.message,
              skipped: recentMessages.has(payload.message.time),
            });

            if (recentMessages.has(payload.message.time)) {
              return false;
            }

            recentMessages.set(payload.message.time, true);

            return true;
          },
        ),
      },
    },
    TwitchMessage: {
      __resolveType(data) {
        return data.command ? 'TwitchChatCommand' : 'TwitchChatMessage';
      },
    },
    TwitchChatCommand: {
      handler: async ({ channel, message, author, args, command }) => {
        const cmd = await getCommand({
          channel,
          author,
          command,
          args,
          message,
        });

        if (cmd?.message) {
          await sendMessage({ channel, message: cmd.message });
        }

        return cmd;
      },
    },
  };
};
