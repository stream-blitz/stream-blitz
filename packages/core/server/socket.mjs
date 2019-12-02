import WebSocket from 'ws';
import getLogger from './logger.mjs';

const HEARTBEAT_INTERVAL = 15000;
let HEARTBEAT;
let SOCKET;

const logger = getLogger('socket');

const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

const initializeConnection = ws => {
  logger.debug('connection upgraded');

  // only use the most recent WebSocket connection to avoid duplicate messages
  SOCKET = ws;

  // send a heartbeat to prevent the WebSocket connection from closing
  clearInterval(HEARTBEAT);
  HEARTBEAT = setInterval(() => {
    sendMessage('heartbeat');
  }, HEARTBEAT_INTERVAL);

  SOCKET.on('message', message => {
    logger.debug('message received', { message });
  });
};

wss.on('connection', initializeConnection);

export const upgradeConnection = (request, socket, head) => {
  logger.debug('upgrading to WebSocket connection...');
  wss.handleUpgrade(request, socket, head, ws => {
    wss.emit('connection', ws, request);
  });
};

export const sendMessage = msg => {
  if (!SOCKET) return;

  logger.debug('sending message', msg);
  SOCKET.send(JSON.stringify(msg));
};
