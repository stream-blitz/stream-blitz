import auth0 from 'auth0-js';
import { navigate } from 'gatsby';
import axios from 'axios';

const isBrowser = typeof window !== 'undefined';

const auth = isBrowser
  ? new auth0.WebAuth({
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENTID,
      redirectUri: process.env.AUTH0_REDIRECT_URI,
      responseType: 'token id_token',
      scope: 'openid profile email',
    })
  : {};

const tokens = {
  accessToken: false,
  idToken: false,
  expiresAt: false,
};

let user = {};

export const isAuthenticated = () => {
  if (!isBrowser) return;

  console.log({ tokens });

  return localStorage.getItem('isLoggedIn') === 'true';
};

export const login = () => {
  if (!isBrowser) return;

  auth.authorize();
};

// TODO we probably don’t need this in the UI, actually
// checking on the API keeps the tokens more secure and
// lets us check on each command instantiation, which is
// maybe slower but I _think_ is more secure
const getTwitchToken = userID =>
  axios
    .post('/.netlify/functions/get-twitch-access-token', { id: userID })
    .then(result => {
      console.log({ result });
      return result;
    })
    .then(result => result.data)
    .catch(error => console.error(error));

const setSession = (cb = () => {}) => async (err, authResult) => {
  if (err) {
    navigate('/');
    cb();
    return;
  }

  if (authResult && authResult.accessToken && authResult.idToken) {
    let expiresAt = authResult.expiresIn * 1000 + new Date().getTime();
    tokens.accessToken = authResult.accessToken;
    tokens.idToken = authResult.idToken;
    tokens.expiresAt = expiresAt;

    const twitchToken = await getTwitchToken(authResult.idTokenPayload.sub);
    user = {
      ...authResult.idTokenPayload,
      twitch: { accessToken: twitchToken },
    };

    localStorage.setItem('isLoggedIn', true);
    navigate('/account');
    cb();
  }
};

export const handleAuthentication = () => {
  if (!isBrowser) return;

  auth.parseHash(setSession());
};

export const getProfile = () => user;

export const silentAuth = callback => {
  if (!isAuthenticated()) {
    return callback();
  }

  auth.checkSession({}, setSession(callback));
};

export const logout = () => {
  localStorage.setItem('isLoggedIn', false);
  auth.logout();
};
