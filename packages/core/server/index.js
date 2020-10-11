require('dotenv').config();
require('honeycomb-beeline')({
  writeKey: process.env.HONEYCOMB_API_KEY,
  dataset: 'stream-blitz-prod', // <= name this whatever you want
  serviceName: 'stream-blitz-server',
  /* ... additional optional configuration ... */
});

const { createServer } = require('http');
const express = require('express');
const pinoHttp = require('pino-http');
const { PubSub } = require('graphql-subscriptions');
const { ApolloServer } = require('apollo-server-express');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const { typeDefs, createResolvers } = require('./schema');
const { logger } = require('./logger');

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
  });

  app.use(pinoHttp({ logger, useLevel: 'debug' }));

  server.applyMiddleware({ app });

  const ws = createServer(app);

  ws.listen(PORT, async () => {
    logger.info(`server is running at http://localhost:${PORT}`);

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
  });
}

main();
