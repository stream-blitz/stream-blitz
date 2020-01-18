import React, { useEffect, useState } from 'react';
import { ApolloClient } from '@apollo/client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import OneGraphAuth from 'onegraph-auth';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

// TODO fix this
// const APP_ID = process.env.GATSBY_APP_ID;
const APP_ID = '06e87f40-97bd-4d82-9ce1-495d880250c5';

const QueryTest = ({ client }) => {
  const { loading, error, data } = useQuery(
    gql`
      query {
        me {
          github {
            id
            login
          }
          twitchTv {
            id
            name
          }
        }
      }
    `,
    { client },
  );

  return (
    <>
      {loading && <p>loading...</p>}
      {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
};

const OneGraphTest = () => {
  const [auth, setAuth] = useState();
  const [client, setClient] = useState();
  const [githubAuth, setGithubAuth] = useState(false);
  const [twitchAuth, setTwitchAuth] = useState(false);

  useEffect(() => {
    if (auth && githubAuth && twitchAuth) return;

    async function checkAuth() {
      if (!auth) return;

      const hasGithubAuth = await auth.isLoggedIn('github');
      const hasTwitchAuth = await auth.isLoggedIn('twitch-tv');

      setGithubAuth(hasGithubAuth);
      setTwitchAuth(hasTwitchAuth);
    }

    if (!auth) {
      const onegraph = new OneGraphAuth({
        appId: APP_ID,
      });

      setAuth(onegraph);
    }

    checkAuth();
  }, [auth, githubAuth, twitchAuth]);

  useEffect(() => {
    if (!auth || client) return;

    const apollo = new ApolloClient({
      uri: `https://serve.onegraph.com/dynamic?app_id=${APP_ID}`,
      cache: new InMemoryCache(),
      request: operation =>
        operation.setContext({ headers: auth.authHeaders() }),
    });

    setClient(apollo);
  }, [auth, client]);

  const loginToGitHub = () => {
    if (!auth) return;

    auth.login('github').then(isLoggedIn => setGithubAuth(isLoggedIn));
  };
  const loginToTwitch = () => {
    if (!auth) return;

    auth.login('twitch-tv').then(isLoggedIn => setTwitchAuth(isLoggedIn));
  };

  return (
    <>
      <h1>OneGraph Auth Test</h1>

      {githubAuth ? (
        <p>Logged into GitHub</p>
      ) : (
        <p>
          Not logged into GitHub{' '}
          <button onClick={loginToGitHub}>log into GitHub</button>
        </p>
      )}

      {twitchAuth ? (
        <p>Logged into Twitch</p>
      ) : (
        <p>
          Not logged into Twitch{' '}
          <button onClick={loginToTwitch}>log into Twitch</button>
        </p>
      )}

      {client && githubAuth && twitchAuth && <QueryTest client={client} />}
    </>
  );
};

export default OneGraphTest;
