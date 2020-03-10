import { Machine, assign } from 'xstate';
import gql from 'graphql-tag';
import { auth } from '../utils/auth';
import { client } from '../utils/client';

const isLoggedIn = async () => {
  const [twitch, netlify] = await Promise.all([
    auth.isLoggedIn('twitch-tv'),
    auth.isLoggedIn('netlify'),
  ]);

  if (!twitch || !netlify) {
    throw new Error('not logged in!');
  }
};

const getAuth = async service => {
  // do we already have the auth for this?
  let isLoggedIn = await auth.isLoggedIn(service);

  if (!isLoggedIn) {
    // no existing login — let’s pop up the OAuth dialog
    isLoggedIn = await auth.login(service);

    // if we STILL aren’t logged in, something went wrong
    if (!isLoggedIn) throw Error(`login to ${service} failed`);
  }

  return isLoggedIn;
};

const getTwitchAuth = async () => {
  await getAuth('twitch-tv');

  const result = await client.query({
    query: gql`
      {
        me {
          twitchTv {
            id
            displayName
          }
        }
      }
    `,
  });

  return result.data.me.twitchTv;
};

const getNetlifyAuth = async () => getAuth('netlify');

const getCurrentConfig = async () => {
  const result = await client.query({
    query: gql`
      {
        settings {
          site_id
        }
      }
    `,
  });

  if (result.data.settings.length === 0) {
    throw new Error('no settings found!');
  }

  return result.data.settings[0];
};

const getNetlifySites = async () => {
  const result = await client.query({
    query: gql`
      {
        netlify {
          sites {
            id
            url
          }
        }
      }
    `,
  });

  return result.data.netlify.sites;
};

const loadEffects = async ({ site }) => {
  const result = await client.query({
    query: gql`
      query($siteID: String!) {
        netlify {
          site(id: $siteID) {
            publishedDeploy {
              availableFunctions {
                name
              }
              url
            }
          }
        }
      }
    `,
    variables: { siteID: site },
  });

  return {
    publicURL: result.data.netlify.site.publishedDeploy.url,
    effects: result.data.netlify.site.publishedDeploy.availableFunctions.map(
      fn => fn.name,
    ),
  };
};

const saveNetlifySiteID = async ({ userID, siteID }) => {
  const result = await client.mutate({
    mutation: gql`
      mutation AddSettings($userID: String!, $siteID: String!) {
        insert_settings(objects: { user_id: $userID, site_id: $siteID }) {
          returning {
            site_id
          }
        }
      }
    `,
    variables: { userID, siteID },
  });

  return !result.errors;
};

export default Machine({
  id: 'dashboard',
  initial: 'checkAuth',
  context: {
    userID: undefined,
    channel: undefined,
    site: undefined,
    sites: [],
    effects: [],
  },
  states: {
    checkAuth: {
      invoke: {
        src: isLoggedIn,
        onDone: 'login',
        onError: 'idle',
      },
    },
    idle: {
      on: {
        LOGIN: 'login',
      },
    },
    login: {
      initial: 'twitch',
      states: {
        twitch: {
          invoke: {
            src: getTwitchAuth,
            onDone: {
              actions: assign((_ctx, event) => ({
                channel: event.data.displayName,
                userID: event.data.id,
              })),
              target: 'netlify',
            },
          },
        },
        netlify: {
          invoke: {
            src: getNetlifyAuth,
            onDone: {
              target: '#configure-user',
            },
          },
        },
      },
    },
    configure: {
      id: 'configure-user',
      initial: 'loading',
      invoke: {
        src: getCurrentConfig,
        onDone: {
          actions: [
            assign((_ctx, event) => ({
              site: event.data && event.data.site_id,
            })),
          ],
          target: 'display',
        },
        onError: '.loading',
      },
      states: {
        loading: {
          invoke: {
            src: getNetlifySites,
            onDone: {
              actions: [assign((_ctx, event) => ({ sites: event.data }))],
              target: 'setSiteID',
            },
          },
        },
        setSiteID: {
          on: {
            SET_SITE_ID: {
              actions: assign((_ctx, event) => {
                return { site: event.site };
              }),
              target: 'saving',
            },
          },
        },
        saving: {
          invoke: {
            src: ctx =>
              saveNetlifySiteID({ siteID: ctx.site, userID: ctx.userID }),
            onDone: {
              target: '#display-effects',
            },
            onError: {
              actions: assign((_ctx, event) => ({
                errorMessage: event.data,
              })),
            },
          },
        },
      },
    },
    display: {
      id: 'display-effects',
      initial: 'loading',
      states: {
        loading: {
          invoke: {
            src: ctx => loadEffects(ctx),
            onDone: {
              actions: assign((_ctx, event) => ({
                effects: event.data.effects,
                publicURL: event.data.publicURL,
              })),
              target: 'loaded',
            },
          },
        },
        loaded: {},
      },
    },
  },
});
