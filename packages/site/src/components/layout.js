/** @jsx jsx */
import { Fragment } from 'react';
import { jsx } from 'theme-ui';
import { Global } from '@emotion/core';
import { Link } from 'gatsby';

const Layout = ({ children }) => (
  <Fragment>
    <Global
      styles={{
        'html,body': {
          background: 'hsla(220, 80%, 80%, 0.1)',
          margin: 0,
          minHeight: '100vh',
        },
        '*': { boxSizing: 'border-box' },
      }}
    />
    <header
      sx={{
        bg: 'background',
        borderBottom: t => `1px solid ${t.colors.ghost}`,
        borderTop: t => `4px solid ${t.colors.primary}`,
        fontFamily: 'body',
        px: '5vw',
        py: 3,
      }}
    >
      <Link
        to="/"
        sx={{ color: 'heading', fontWeight: 900, textDecoration: 'none' }}
      >
        Stream Blitz
      </Link>
    </header>
    <main
      sx={{
        color: 'text',
        fontFamily: 'body',
        maxWidth: 540,
        mx: 'auto',
        width: '90vw',
      }}
    >
      {children}
    </main>
  </Fragment>
);

export default Layout;
