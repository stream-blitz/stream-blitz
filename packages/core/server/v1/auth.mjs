// import uuidAPIkey from 'uuid-apikey';
// import basicAuth from 'basic-auth';
// import graphql from './graphql.mjs';
// import getLogger from './logger.mjs';

// const logger = getLogger('auth');

// const apiKeyAuth = (req, res, next) => {
//   const { pass: apiKey } = basicAuth(req);
//   const { channel } = req.body;
//   logger.debug('verifying auth', { apiKey, channel });

//   graphql(
//     `
//       query($channel: name!) {
//         channels(where: { name: { _eq: $channel } }) {
//           id
//         }
//       }
//     `,
//     {
//       channel,
//     },
//   )
//     .then(response => {
//       const { id } = response.data.channels[0];

//       logger.debug({ id, match: uuidAPIkey.check(apiKey, id) });

//       if (!uuidAPIkey.check(apiKey, id)) {
//         res.status(401).send('Unauthorized');
//       }

//       next();
//     })
//     .catch(error => {
//       logger.error(error);
//     });
// };

// export default (req, res, next) => {
//   if (req.header('Authorization').match(/^Basic/)) {
//     apiKeyAuth(req, res, next);
//   } else {
//     requireValidJWT(req, res, next);
//   }
// };
