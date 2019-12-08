/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useMachine } from '@xstate/react';
import fetchMachine from '../state-machines/fetch';
import { getProfile, getAccessToken } from '../utils/auth';
import Container from './container';
import Overlay from './overlay';
import Commands from './commands';
import CreateCommand from './create-command';

const AccountDashboard = () => {
  const [state, send] = useMachine(fetchMachine, {
    context: { user: getProfile(), token: getAccessToken(), commands: [] },
  });

  return (
    <Container>
      <h1>Dashboards</h1>
      <section
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 30%)',
          gridGap: '3%',
        }}
      >
        <CreateCommand send={send} />
        <Commands state={state} />
        <Overlay state={state} />
      </section>
    </Container>
  );
};

export default AccountDashboard;
