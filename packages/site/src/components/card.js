/** @jsx jsx */
import { jsx } from 'theme-ui';

const Card = ({ children }) => {
  return (
    <div
      sx={{
        bg: 'background',
        border: t => `1px solid ${t.colors.ghost}`,
        borderRadius: 5,
        m: 3,
        p: 3,
      }}
    >
      {children}
    </div>
  );
};

export default Card;
