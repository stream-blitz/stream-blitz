/** @jsx jsx */
import { jsx } from 'theme-ui';
import Card from './card';

const LoggingIn = () => {
  return (
    <Card>
      <h1
        sx={{
          textAlign: 'center',
        }}
      >
        Logging in...
      </h1>
      <p
        sx={{
          textAlign: 'center',
        }}
      >
        Authorizing with Twitch and Netlify. Please use the pop-up windows to
        complete the sign-in flow with those services.
      </p>
      <p
        sx={{
          textAlign: 'center',
        }}
      >
        <strong>NOTE:</strong> If you don’t see a pop-up window, your browser
        may be blocking pop-ups, which is usually a good thing but — in this
        case — it’s a real bummer.
      </p>
    </Card>
  );
};

export default LoggingIn;
