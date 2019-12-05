import uuidAPIkey from 'uuid-apikey';
import basicAuth from 'basic-auth';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';
import graphql from './graphql.mjs';
import getLogger from './logger.mjs';

const logger = getLogger('auth');

// We use Auth0 for validation, so we need to check that JWTs are valid.
const requireValidJWT = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

const apiKeyAuth = (req, res, next) => {
  const { pass: apiKey } = basicAuth(req);
  const { channel } = req.body;
  logger.debug('verifying auth', { apiKey, channel });

  graphql(
    `
      query($channel: name!) {
        channels(where: { name: { _eq: $channel } }) {
          id
        }
      }
    `,
    {
      channel,
    },
  )
    .then(response => {
      const { id } = response.data.channels[0];

      logger.debug({ id, match: uuidAPIkey.check(apiKey, id) });

      if (!uuidAPIkey.check(apiKey, id)) {
        res.status(401).send('Unauthorized');
      }

      next();
    })
    .catch(error => {
      logger.error(error);
    });
};

export default (req, res, next) => {
  if (req.header('Authorization').match(/^Basic/)) {
    apiKeyAuth(req, res, next);
  } else {
    requireValidJWT(req, res, next);
  }
};
