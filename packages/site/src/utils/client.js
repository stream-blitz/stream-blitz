import ApolloClient from 'apollo-boost';
import fetch from 'isomorphic-fetch';
import { auth } from './auth';

export const client = new ApolloClient({
  fetch,
  uri: `https://db.streamblitz.com/v1/graphql`,
  request: operation => {
    console.log(auth.authHeaders());
    return operation.setContext({ headers: auth.authHeaders() });
  },
});
