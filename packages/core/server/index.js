require('dotenv').config();

const { createServer } = require('http');
const express = require('express');
const { PubSub } = require('graphql-subscriptions');
const { ApolloServer } = require('apollo-server-express');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const { createChatBot } = require('./chatbot');
const { typeDefs, createResolvers } = require('./schema');

const PORT = process.env.PORT || 9797;

async function main() {
  const app = express();
  const pubsub = new PubSub();
  const resolvers = createResolvers(pubsub);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    uploads: false,
    playground: true,
    introspection: true,

    // TODO hook into JWTs for auth
    context: context => {
      return { auth: { isAuthenticated: true, scope: ['test:*'] } };
    },
  });

  server.applyMiddleware({ app });

  const ws = createServer(app);

  ws.listen(PORT, async () => {
    console.log(`server is running at http://localhost:${PORT}`);

    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema: makeExecutableSchema({ typeDefs, resolvers }),
      },
      {
        server: ws,
        path: '/graphql',
      },
    );

    createChatBot(pubsub);
  });
}

main();
