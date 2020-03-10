import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import dashboardMachine from '../state-machines/dashboard';
import Layout from '../components/layout';
import Login from '../components/login';
import LoggingIn from '../components/logging-in';
import Overlay from '../components/overlay';
import EffectsList from '../components/effects-list';

export default () => {
  const [siteID, setSiteID] = useState();
  const [state, send] = useMachine(dashboardMachine);

  return (
    <Layout>
      {state.matches('idle') && <Login handleClick={() => send('LOGIN')} />}

      {state.matches('login') && <LoggingIn />}

      {state.matches({ configure: 'setSiteID' }) && (
        <form
          onSubmit={event => {
            event.preventDefault();
            send('SET_SITE_ID', { site: siteID });
          }}
        >
          <label htmlFor="netlifySiteID">
            Which site has your effects functions?
          </label>
          <select
            name="netlifySiteID"
            id="netlifySiteID"
            onBlur={event => setSiteID(event.target.value)}
          >
            <option value="">-- choose a site from the dropdown --</option>
            {state.context.sites.map(({ id, url }) => (
              <option key={id} value={id}>
                {url}
              </option>
            ))}
          </select>
          <button type="submit">Save Site ID</button>
        </form>
      )}

      {state.matches({ display: 'loaded' }) && (
        <>
          <Overlay state={state} />
          <EffectsList state={state} />
        </>
      )}
    </Layout>
  );
};
