/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useMachine } from '@xstate/react';
import effectMachine from '../state-machines/effect';

const Effect = ({ publicURL, effect, channel, userID }) => {
  const [state] = useMachine(
    effectMachine.withContext({
      channel,
      userID,
      url: publicURL,
      name: effect,
    }),
  );

  if (state.matches('invalid') || state.matches('failure')) {
    // TODO add docs
    return null;
  }

  if (state.matches('success')) {
    const { name, description } = state.context;

    return (
      <div
        sx={{
          pb: 4,
          mt: 3,
          borderBottom: t => `1px solid ${t.colors.ghost}`,
        }}
      >
        <h3 sx={{ m: 0 }}>!{name}</h3>
        <p>{description}</p>
      </div>
    );
  }

  return null;
};

export default Effect;
