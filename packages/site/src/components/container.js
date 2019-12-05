/** @jsx jsx */
import { jsx } from 'theme-ui';

const Container = ({ children }) => (
  <div sx={{ mx: 'auto', maxWidth: '90vw' }}>{children}</div>
);

export default Container;
