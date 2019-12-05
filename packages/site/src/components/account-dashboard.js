/** @jsx jsx */
import { jsx } from 'theme-ui';
import Container from './container';
import { useEffect, useState } from 'react';
import { getProfile, getAccessToken } from '../utils/auth';

const AccountDashboard = () => {
  const [commands, setCommands] = useState([]);
  useEffect(() => {
    const user = getProfile();

    fetch('http://localhost:9999/commands/list', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel: user.name }),
    })
      .then(res => res.json())
      .then(commands => {
        setCommands(commands);
      });
  }, []);

  return (
    <Container>
      <h1>Dashboards</h1>
      <section>
        <h2>Your Commands</h2>
        <ul>
          {commands.map(command => (
            <li key={command.id}>
              <strong>{command.name}</strong> ({command.handler})
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
};

export default AccountDashboard;
