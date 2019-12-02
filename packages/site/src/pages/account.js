import React from 'react';
import { Router } from '@reach/router';
import { Link } from 'gatsby';
import { login, isAuthenticated, getProfile, logout } from '../utils/auth';

const Home = ({ user }) => <p>Hi, {user.name ? user.name : 'friend'}</p>;
const Settings = () => <p>Settings</p>;
const Billing = () => <p>Billing</p>;

const Account = () => {
  if (!isAuthenticated()) {
    login();
    return <p>Redirecting to login...</p>;
  }

  const user = getProfile();
  console.log({ user });

  return (
    <>
      <nav>
        <Link to="/account">Home</Link>
        <Link to="/account/settings">Settings</Link>
        <Link to="/account/billing">Billing</Link>
        <button
          onClick={event => {
            event.preventDefault();
            logout();
          }}
        >
          Log Out
        </button>
      </nav>
      <Router>
        <Home path="/account" user={user} />
        <Settings path="/account/settings" />
        <Billing path="/account/billing" />
      </Router>
    </>
  );
};

export default Account;
