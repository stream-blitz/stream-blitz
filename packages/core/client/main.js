import playSound from './util/play-sound.js';
import sleep from './util/sleep.js';

// on http:// we need to use ws:// but over SSL we need to use wss://
// this is kind of a hack to make sure we’re always matching protocols
const ws = new WebSocket(
  `${location.protocol.replace('http', 'ws')}//${location.host}`,
);

// seconds * 1000 to get a timeout
const CMD_COOLDOWN = 30 * 1000;
const cmdDisplay = document.querySelector('.command-display');

const commandsOnTimeOut = new Map();
let IS_ACTIVE = false;

const handleCommand = async msg => {
  console.log({ IS_ACTIVE, timeout: commandsOnTimeOut.keys(), msg });
  // if we’re in the middle of something, bail
  if (IS_ACTIVE) return;

  // if this command has been called too recently, bail
  if (commandsOnTimeOut.get(msg.name)) return;

  IS_ACTIVE = true;

  const duration = (msg.duration || 4) * 1000;

  // play audio if the command has any
  if (msg.sfx) {
    playSound(msg.sfx);

    // set a cooldown period to avoid being too noisy
    commandsOnTimeOut.set(msg.name, true);
    setTimeout(() => {
      commandsOnTimeOut.delete(msg.name);
    }, CMD_COOLDOWN);
  }

  // show a GIF if the command has one
  if (msg.gif) {
    const img = cmdDisplay.querySelector('img');
    img.classList.add('command-image', 'visible');
    img.src = msg.gif;

    const text = cmdDisplay.querySelector('text');
    text.innerText = `${msg.user} redeemed ${msg.name}`;

    await sleep(50);
    cmdDisplay.classList.add('visible');

    // don’t use `wait` because
    setTimeout(() => {
      cmdDisplay.classList.remove('visible');
    }, duration);
  }

  // wait for the command to be over, then remove the active status
  await sleep(duration);
  IS_ACTIVE = false;
};

ws.onerror = () => {
  console.error('WebSocket error!');
};

ws.onopen = () => {
  console.log('WebSocket connection established');
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};

ws.onmessage = event => {
  const url = new URL(location);
  const msg = JSON.parse(event.data);

  // only fire commands intended for this channel
  if (url.searchParams.get('channel') !== msg.channel) {
    return;
  }

  if (msg === 'heartbeat') {
    ws.send('I ATEN’T DEAD');
  }

  if (msg.type === 'chat') {
    handleChat(msg);
  }

  handleCommand(msg);
};
