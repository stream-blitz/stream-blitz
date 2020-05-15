import http from 'http';
import router from './router.mjs';
import { upgradeConnection } from './socket.mjs';
import getLogger from './logger.mjs';

const logger = getLogger('http');

export default () => {
  logger.debug('initializing server...');
  const server = http.createServer(router);
  const port = process.env.PORT || 9797;

  server.on('upgrade', upgradeConnection);

  server.listen(port, () => {
    logger.debug(`server listening at http://localhost:${port}`);
  });
};
