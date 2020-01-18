/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Router } from '@reach/router';
import { Link } from 'gatsby';
import Layout from '../components/layout';
import AccountDashboard from '../components/account-dashboard';

const Settings = () => <p>Settings</p>;
const Billing = () => <p>Billing</p>;

const Account = () => {
  // TODO load user info
  const user = {};

  return (
    <Layout>
      <nav
        sx={{
          alignItems: 'baseline',
          borderBottom: t => `1px solid ${t.colors.ghost}`,
          display: 'flex',
          justifyContent: 'flex-start',
          px: '5vw',
          'a,button': {
            bg: 'transparent',
            border: 'none',
            color: 'heading',
            display: 'inline-block',
            fontSize: 1,
            textDecoration: 'none',
            p: 1,
            '&.active': { bg: 'primary', color: 'background' },
          },
        }}
      >
        <Link activeClassName="active" to="/account">
          Dashboard
        </Link>
        <Link activeClassName="active" to="/account/settings">
          Settings
        </Link>
        <Link activeClassName="active" to="/account/billing">
          Billing
        </Link>

        <button
          sx={{ ml: 'auto' }}
          onClick={event => {
            event.preventDefault();
            // TODO log out
          }}
        >
          Log Out
        </button>
      </nav>
      <Router>
        <AccountDashboard path="/account" user={user} />
        <Settings path="/account/settings" />
        <Billing path="/account/billing" />
      </Router>
    </Layout>
  );
};

export default Account;
