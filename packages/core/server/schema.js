const fetch = require('node-fetch');
const { getTwitchAccessToken } = require('@jlengstorf/get-twitch-oauth');
const { gql } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

exports.typeDefs = gql`
  scalar Date

  type Query {
    channel(username: String!): Channel!
  }

  enum ChannelStatus {
    LIVE
    OFFLINE
  }

  type Channel {
    id: ID!
    username: String!
    description: String!
    status: ChannelStatus!
    stream: Stream
  }

  type Stream {
    id: ID!
    title: String!
    startTime: Date!
  }

  type Subscription {
    chat: ChatMessage!
  }

  type ChatMessage {
    displayName: String!
    message: String!
    color: String!
    emotes: [[String!]!]
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

        console.log(JSON.stringify({ user, stream }, null, 2));

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
      chat: {
        subscribe: () => pubsub.asyncIterator(['CHAT']),
      },
    },
  };
};
