import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import dashboardMachine from '../state-machines/dashboard';
import Layout from '../components/layout';
import Effect from '../components/effect';

export default () => {
  const [siteID, setSiteID] = useState();
  const [state, send] = useMachine(dashboardMachine);

  return (
    <Layout>
      {state.matches('idle') && (
        <>
          <button onClick={() => send('LOGIN')}>log in</button>
        </>
      )}

      {state.matches('login') && (
        <>
          <p>logging in...</p>
        </>
      )}

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
          <ul>
            {console.log(state.context)}
            {state.context.effects.map(({ name }) => (
              <li key={name}>
                <Effect
                  publicURL={state.context.publicURL}
                  effect={name}
                  channel={state.context.channel}
                  userID={state.context.userID}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </Layout>
  );
};
