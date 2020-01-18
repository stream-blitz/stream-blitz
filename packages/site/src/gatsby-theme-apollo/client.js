import ApolloClient from 'apollo-boost';
import OneGraphAuth from 'onegraph-auth';
import fetch from 'isomorphic-fetch';

// TODO fix this
// const APP_ID = process.env.GATSBY_APP_ID;
const APP_ID = '06e87f40-97bd-4d82-9ce1-495d880250c5';

const auth =
  typeof window !== 'undefined'
    ? new OneGraphAuth({
        appId: APP_ID,
      })
    : { authHeaders: () => {} };

const client = new ApolloClient({
  fetch,
  uri: `https://db.streamblitz.com/v1/graphql`,
  request: operation => operation.setContext({ headers: auth.authHeaders() }),
});

export default client;
