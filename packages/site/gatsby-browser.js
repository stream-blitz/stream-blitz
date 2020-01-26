import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import { client } from './src/utils/client';

export const wrapRootElement = ({ element }) => (
  <ApolloProvider client={client}>{element}</ApolloProvider>
);
