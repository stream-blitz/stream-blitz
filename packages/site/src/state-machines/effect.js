import fetch from 'isomorphic-fetch';
import { Machine, send, assign } from 'xstate';

const loadEffectPayload = async ({ url, name, channel }) => {
  const data = await fetch(`${url}/.netlify/functions/${name}`, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      user: 'StreamBlitz',
      message: '',
      flags: {},
      extra: { channel },
    }),
  }).then(response => response.json());

  console.log({ data });

  return data;
};

const effectMachine = Machine({
  id: 'effect',
  initial: 'loading',
  context: {
    channel: undefined,
    url: undefined,
    name: undefined,
    description: undefined,
    message: undefined,
    image: undefined,
    sound: undefined,
  },
  states: {
    unknown: {
      on: {
        '': [
          {
            target: 'loading',
            cond: ({ url, channel, name }) => url && channel && name,
          },
          { target: 'invalid' },
        ],
      },
    },
    loading: {
      invoke: {
        src: ({ url, channel, name }) =>
          loadEffectPayload({ url, channel, name }),
        onDone: {
          actions: [
            assign((_ctx, event) => ({ ...event.data })),
            send('RESOLVE'),
          ],
        },
        onError: {
          actions: send('REJECT'),
        },
      },
      on: {
        RESOLVE: 'success',
        REJECT: 'failure',
      },
    },
    success: {
      type: 'final',
    },
    failure: {},
    invalid: {},
  },
});

export default effectMachine;
