import OneGraphAuth from 'onegraph-auth';

export const auth =
  typeof window !== 'undefined'
    ? new OneGraphAuth({ appId: process.env.GATSBY_ONEGRAPH_ID })
    : { authHeaders: () => {} };
