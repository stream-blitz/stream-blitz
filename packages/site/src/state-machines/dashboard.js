import { Machine, send, spawn, assign } from 'xstate';
import gql from 'graphql-tag';
import { auth } from '../utils/auth';
import { client } from '../utils/client';

const checkAuth = async () => {
  const [twitchAuth, netlifyAuth] = await Promise.all([
    auth.isLoggedIn('twitch-tv'),
    auth.isLoggedIn('netlify'),
  ]);

  return twitchAuth && netlifyAuth;
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

  return result.data.settings ? result.data.settings[0] : false;
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

const loadEffects = async siteID => {
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
    variables: { siteID },
  });

  return {
    publicURL: result.data.netlify.site.publishedDeploy.url,
    effects: result.data.netlify.site.publishedDeploy.availableFunctions.map(
      fn => fn.name,
    ),
  };
};

const saveNetlifySiteID = async ({ userID, siteID }) => {
  console.log({ siteID, userID });
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

  console.log(result);

  return !result.errors;
};

const effectMachine = Machine({
  id: 'effect',
  initial: 'idle',
  context: {
    name: undefined,
  },
  states: {
    idle: {
      on: {
        PLAY_EFFECT: 'playing',
      },
    },
    playing: {},
  },
});

export default Machine({
  id: 'dashboard',
  initial: 'unknown',
  context: {
    userID: undefined,
    channel: undefined,
    site: undefined,
    sites: [],
    effects: [],
  },
  on: {
    LOGIN_SUCCESS: 'configure',
    SITE_CONFIGURED: 'display',
  },
  states: {
    unknown: {
      on: {
        '': [{ target: 'configure', cond: checkAuth }, { target: 'login' }],
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
              actions: send('LOGIN_SUCCESS'),
            },
          },
        },
      },
    },
    configure: {
      initial: 'loading',
      invoke: {
        src: getCurrentConfig,
        onDone: {
          actions: [
            assign((_ctx, event) => ({
              site: event.data && event.data.site_id,
            })),
            send('CONFIG_LOADED'),
          ],
        },
      },
      on: {
        CONFIG_LOADED: [
          { target: 'display', cond: ctx => ctx && ctx.site },
          { target: '.loading' },
        ],
        SITES_LOADED: '.setSiteID',
      },
      states: {
        loading: {
          invoke: {
            src: getNetlifySites,
            onDone: {
              actions: [
                assign((_ctx, event) => ({ sites: event.data })),
                send('SITES_LOADED'),
              ],
            },
          },
        },
        setSiteID: {
          on: {
            SET_SITE_ID: {
              actions: assign((_ctx, event) => {
                console.log(event);
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
              actions: send('SITE_CONFIGURED'),
            },
            onError: {
              actions: assign((_ctx, event) => ({ errorMessage: event.data })),
            },
          },
        },
      },
    },
    display: {
      initial: 'loading',
      states: {
        loading: {
          invoke: {
            src: ctx => loadEffects(ctx.site),
            onDone: {
              actions: assign((_ctx, event) => ({
                effects: event.data.effects,
                publicURL: event.data.publicURL,
              })),
              target: 'loaded',
            },
          },
        },
        loaded: {
          entry: assign({
            effects: ctx =>
              ctx.effects.map(effect => ({
                name: effect,
                ref: spawn(effectMachine.withContext({ name: effect })),
              })),
          }),
        },
      },
    },
  },
});