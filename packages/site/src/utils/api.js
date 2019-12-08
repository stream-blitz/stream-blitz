import axios from 'axios';
import { isAuthenticated, getAccessToken } from './auth';

export const post = (url, data) =>
  new Promise((resolve, reject) => {
    if (!isAuthenticated()) {
      reject('not logged in');
    }

    axios
      .post(url, data, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })
      .then(result => resolve(result))
      .catch(error => reject(error));
  });
