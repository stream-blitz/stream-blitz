import { Machine } from 'xstate';
import { auth } from '../utils/auth';

const getAuth = async () => {
  const twitchAuth = await auth.login('twitch-tv');

  if (!twitchAuth) {
    throw Error('login to Twitch failed');
  }

  const netlifyAuth = await auth.login('netlify');

  if (!netlifyAuth) {
    throw Error('login to Netlify failed');
  }
};

const logout = async () =>
  Promise.all([auth.logout('netlify'), auth.logout('twitch-tv')]);

export default Machine({
  id: 'auth',
  initial: 'idle',
  states: {
    idle: {
      on: {
        LOGIN: 'loggingIn',
      },
    },
    loggingIn: {
      invoke: {
        src: getAuth,
        onDone: { target: 'loggedIn' },
        onError: 'loginError',
      },
    },
    loggedIn: {
      on: {
        LOGOUT: 'loggingOut',
      },
    },
    loggingOut: {
      invoke: {
        src: logout,
        onDone: 'idle',
      },
    },
    loginError: {
      on: {
        RETRY: 'loggingIn',
        RESET: 'idle',
      },
    },
  },
});
