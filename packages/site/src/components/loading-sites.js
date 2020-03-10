/** @jsx jsx */
import { jsx } from 'theme-ui';
import Card from './card';

const LoadingSites = () => {
  return (
    <Card>
      <h1
        sx={{
          textAlign: 'center',
        }}
      >
        Loading sites...
      </h1>
      <p
        sx={{
          textAlign: 'center',
        }}
      >
        We’re pulling up your list of sites from Netlify.
      </p>
    </Card>
  );
};

export default LoadingSites;
