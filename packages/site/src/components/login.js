/** @jsx jsx */
import { jsx } from 'theme-ui';
import Card from './card';

const Login = ({ handleClick }) => {
  return (
    <Card>
      <h1>Log into Stream Blitz</h1>
      <p>
        Authorize with your Twitch and Netlify accounts to start using Stream
        Blitz today!
      </p>
      <button
        sx={{
          bg: 'primary',
          border: 'none',
          borderRadius: 5,
          color: 'background',
          fontSize: 3,
          fontWeight: 800,
          px: 4,
          py: 2,
          textTransform: 'uppercase',
        }}
        onClick={handleClick}
      >
        log in
      </button>
    </Card>
  );
};

export default Login;
