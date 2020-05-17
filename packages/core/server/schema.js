const fetch = require('node-fetch');
const { getTwitchAccessToken } = require('@jlengstorf/get-twitch-oauth');
const { gql } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { getCommand } = require('./commands');

exports.typeDefs = gql`
  scalar Date

  type Query {
    channel(username: String!): TwitchChannel!
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
    message: TwitchMessage!
  }

  interface TwitchMessage {
    message: String!
    author: TwitchChatAuthor!
    emotes: [TwitchEmote!]!
    time: Date!
  }

  type TwitchChatMessage implements TwitchMessage {
    html: String!
    message: String!
    author: TwitchChatAuthor!
    emotes: [TwitchEmote!]!
    time: Date!
  }

  type TwitchChatCommand implements TwitchMessage {
    command: String!
    arguments: [String!]!
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
        const { access_token } = await getTwitchAccessToken();

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
          fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Client-ID': process.env.TWITCH_CLIENT_ID,
            },
          })
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
      },
    },
    Subscription: {
      message: {
        subscribe: () => pubsub.asyncIterator(['MESSAGE']),
      },
    },
    TwitchMessage: {
      __resolveType(data) {
        return data.command ? 'TwitchChatCommand' : 'TwitchChatMessage';
      },
    },
    TwitchChatCommand: {
      handler: ({ channel, message, author, arguments, command }) => {
        return getCommand({
          channel,
          author,
          command,
          arguments,
          message,
        });
      },
    },
  };
};
