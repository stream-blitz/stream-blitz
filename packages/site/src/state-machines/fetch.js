import { Machine, assign } from 'xstate';
import axios from 'axios';

const getUserCommands = async ({ user, token }) => {
  const commands = await axios.post(
    `${process.env.GATSBY_STREAM_BLITZ_API}/commands/list`,
    { channel: user.name },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return commands.data;
};

const runHandler = context => command =>
  axios
    .post(command.handler, {
      user: 'Stream Blitz',
      message: null,
      flags: {},
      extra: { channel: context.user.name },
    })
    .then(({ data }) => ({ ...command, details: data }))
    .catch(err => ({ ...command, error: err.message }));

const getCommandDetails = async (context, event) => {
  const commands = await Promise.all(event.data.map(runHandler(context)));

  return commands.filter(Boolean);
};

export default Machine(
  {
    id: 'fetch',
    initial: 'loadingCommands',
    states: {
      loadingCommands: {
        invoke: {
          src: getUserCommands,
          onDone: {
            target: 'loadingCommandDetails',
            actions: ['setCommands'],
          },
          onError: {
            target: 'error',
          },
        },
      },
      loadingCommandDetails: {
        invoke: {
          src: getCommandDetails,
          onDone: {
            target: 'loaded',
            actions: ['setCommands'],
          },
          onError: {
            target: 'error',
          },
        },
      },
      loaded: {
        on: {
          RELOAD: 'loadingCommands',
        },
      },
      error: {},
    },
  },
  {
    actions: {
      setCommands: assign({
        commands: (_context, event) => event.data,
      }),
    },
  },
);
