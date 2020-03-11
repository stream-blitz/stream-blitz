/** @jsx jsx */
import { jsx } from 'theme-ui';
import Card from './card';
import Effect from './effect';

const EffectsList = ({ state }) => {
  return (
    <Card>
      <h2>Your Effects</h2>
      {state.context.effects.map(name => (
        <Effect
          key={name}
          publicURL={state.context.publicURL}
          effect={name}
          channel={state.context.channel}
          userID={state.context.userID}
        />
      ))}
    </Card>
  );
};

export default EffectsList;
