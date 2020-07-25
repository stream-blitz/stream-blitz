# @stream-blitz/create-handler

Create an effect handler to respond to chat commands on Twitch.

## Install

```bash
npm install @stream-blitz/create-handler
```

## Usage

Basic usage:

```js
const createHandler = require('@stream-blitz/create-handler');

exports.handler = createHandler({
  name: 'ahem',
  description: 'Pay attention!',
  handler: () => ({
    message: 'Hey. Look at me.', // chat message
    audio: 'https://example.com/assets/ahem.mp3', // sound effect played on stream
    image: 'https://example.com/assets/knock.gif', // image shown on stream
    duration: 3,
  }),
});
```

### Advanced Usage

This example handler returns all available settings:

```js
const createHandler = require('@stream-blitz/create-handler');

exports.handler = createHandler({
  name: 'boop',
  description: 'Do a mischief on a the screen!',
  handler: ({ message, command, arguments, author, extra }) => {
    // only allow moderators to fire this command
    if (!author.roles.includes('MODERATOR')) {
      return;
    }

    console.log(`The full chat message is “${message}”`);
    console.log(`The command called is “${command}”`);
    console.log(`The arguments for this command are “${arguments.join(', ')}”`);
    console.log(`The user who called this command is @${author.username}`);
    console.log(`The Twitch channel where this command should run is ${extra.channel}`);

    return {
      message: 'BOOP!',
      audio: 'https://example.org/assets/boop.mp3',
      image: 'https://example.org/assets/boop.gif',
      duration: 2,
    };
  },
});
```

## API

### `createHandler` API

| name          | required | description                                                     |
| ------------- | -------- | --------------------------------------------------------------- |
| `name`        | yes      | Name of the command. Only letters, numbers, & hyphens.          |
| `description` |          | A description of what the command does.                         |
| `handler`     | yes      | A function to handle the command. Must return a valid `Effect`. |

### `handler` arguments

| name              | description                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| `message`         | Full message as sent to Twitch chat                                    |
| `command`         | Name of the command that was called                                    |
| `arguments`       | Array of arguments passed to the command                               |
| `author`          | Object with information about the user who called the command          |
| `author.id`       | Twitch user ID                                                         |
| `author.username` | Twitch username                                                        |
| `author.roles`    | Array of user roles (values: `MODERATOR`, `SUBSCRIBER`, `BROADCASTER`) |
| `extra`           | Additional information about the command                               |
| `extra.channel`   | The Twitch channel username where the chat message was posted          |

### `Effect` return type

All `handler` functions must return an object with the following properties. All of these properties are optional, but if you don’t include any of them, nothing will happen when your effect is called, and that would be a real bummer.

| name       | type   | description                                           | default |
| ---------- | ------ | ----------------------------------------------------- | ------- |
| `message`  | string | A message to send to chat. Can include Twitch emotes. |         |
| `audio`    | string | URL of an MP3 file to play as part of the effect.     |         |
| `image`    | string | URL of an image to display as part of the effect.     |         |
| `duration` | number | Number of seconds to show the image on screen.        | `4`     |
