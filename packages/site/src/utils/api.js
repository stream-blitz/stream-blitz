import axios from 'axios';

export const post = (url, data) =>
  new Promise((resolve, reject) => {
    // TODO ensure authentication

    axios
      .post(url, data, {
        headers: {
          Authorization: `Bearer ${'TODO'}`,
        },
      })
      .then(result => resolve(result))
      .catch(error => reject(error));
  });
