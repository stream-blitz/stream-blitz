import axios from 'axios';
import getLogger from './logger.mjs';

const logger = getLogger('graphql');

const endpoint = process.env.HASURA_GRAPHQL_URI;
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'X-Hasura-Admin-Secret': process.env.HASURA_ADMIN_SECRET,
};

export default (query, variables = {}) =>
  axios
    .post(endpoint, { query, variables }, { headers })
    .then(response => response.data)
    .catch(error => logger.error(error));
