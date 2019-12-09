/** @jsx jsx */
import { jsx } from 'theme-ui';

const Overlay = ({ state }) => {
  return (
    <div sx={{ gridArea: 'widget2' }}>
      <h2>Your Overlay URL</h2>
      <p>
        Add the following URL as a browser source in your streaming software to
        enable Stream Blitz sound effects.
      </p>
      <input
        type="url"
        value={`https://api.streamblitz.com/?channel=${state.context.user.name}`}
        disabled
        sx={{
          border: t => `1px solid ${t.colors.primary}`,
          borderRadius: 3,
          fontSize: 2,
          mb: 3,
          p: 2,
          width: '100%',
        }}
      />
    </div>
  );
};

export default Overlay;
