# Stream Blitz

Stream Blitz is a service designed to make adding sound effects to your Twitch™ streams feel like deploying serverless functions.

> ⚠️ This product is still in alpha. If you’d like to be added as an alpha tester, please contact <jason@lengstorf.com>.

## How it works

1. Join Stream Blitz
2. Create a serverless handler
3. [Deploy to Netlify](https://netlify.com/?utm_source=twitch-blitz-jl&utm_medium=github&utm_campaign=devex)
4. Run your sound effect!

### Creating a Stream Blitz serverless handler

1.  Install the serverless handler util

    ```bash
    # install the handler util
    yarn add @stream-blitz/create-handler
    ```

2.  Create a serverless function:

    ```js
    const createHandler = require('@stream-blitz/create-handler');

    exports.handler = createHandler(({ extra: { channel } }) => ({
      name: 'blitzed',
      message: 'KAPOW YOU GOT BLITZED! MorphinTime',
      sfx:
        'https://res.cloudinary.com/jlengstorf/video/upload/q_auto/v1569957993/lwj-sfx/blitzed.mp3',
      gif:
        'https://res.cloudinary.com/jlengstorf/image/upload/q_auto,f_auto,w_400/v1573512575/lwj-sfx/victory',
      channel,
    }));
    ```

3.  Register your serverless function

    TODO: make this self-service

## TODO

- [ ] Add a UI 
  - [x] auth with Twitch
  - [ ] get an API key (in progress)
  - [ ] register commands using serverless handlers
  - [ ] register commands via UI only
  - [ ] register chat handlers
  - [ ] get overlay URL
  - [ ] register custom overlay styles
  - [ ] register custom overlay scripts
- [ ] add chat handling
- [ ] add support for API key reset
- [ ] add support for multi-channel commands (e.g. teams opting into SFX)
