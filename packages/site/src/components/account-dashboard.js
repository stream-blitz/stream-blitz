/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useMachine } from '@xstate/react';
import fetchMachine from '../state-machines/fetch';
import Container from './container';
import Overlay from './overlay';
import Commands from './commands';
import CreateCommand from './create-command';

const AccountDashboard = () => {
  const [state, send] = useMachine(fetchMachine, {
    context: { user: {}, token: {}, commands: [] },
  });

  return (
    <Container>
      <h1>Dashboards</h1>
      <section
        sx={{
          display: 'grid',
          gridTemplateAreas: `
            "widget1 main"
            "widget2 main"
            "widget3 main"`,
          gridTemplateColumns: '220px auto',
          gridGap: '20px',
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
