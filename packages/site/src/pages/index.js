import React from 'react';
import { useMachine } from '@xstate/react';
import dashboardMachine from '../state-machines/dashboard';
import Layout from '../components/layout';
import Login from '../components/login';
import LoggingIn from '../components/logging-in';
// import Overlay from '../components/overlay';
import LoadingSites from '../components/loading-sites';
import SiteChooser from '../components/site-chooser';
import EffectsList from '../components/effects-list';

export default () => {
  const [state, send] = useMachine(dashboardMachine);

  return (
    <Layout>
      {state.matches('idle') && <Login handleClick={() => send('LOGIN')} />}

      {state.matches('login') && <LoggingIn />}

      {state.matches({ configure: 'loading' }) && <LoadingSites />}

      {state.matches({ configure: 'setSiteID' }) && (
        <SiteChooser state={state} send={send} />
      )}

      {state.matches({ display: 'loaded' }) && (
        <>
          {/* <Overlay state={state} /> */}
          <EffectsList state={state} />
        </>
      )}
    </Layout>
  );
};
