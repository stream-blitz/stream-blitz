/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Fragment } from 'react';

const Commands = ({ state }) => {
  if (state.matches('error')) {
    return <p>error loading commands</p>;
  }

  return (
    state.matches('loaded') && (
      <div sx={{ gridArea: 'main' }}>
        <h2>Your Commands</h2>
        {state.context.commands.length > 0 ? (
          <ul
            sx={{
              listStyle: 'none',
              p: 0,
              'li + li': { mt: 3 },
              'li:last-of-type': { mb: 4 },
            }}
          >
            {state.context.commands.map(command => (
              <li key={command.id}>
                <details>
                  <summary>
                    <strong>{command.name}</strong>
                    {command.details.description && (
                      <span sx={{ display: 'block', pl: 3, fontSize: 0 }}>
                        {command.details.description}
                      </span>
                    )}
                  </summary>

                  <ul sx={{ listStyle: 'none', mt: 3, pl: 3 }}>
                    <li>
                      Registered handler:
                      <br />
                      <code>{command.handler}</code>
                    </li>
                    {command.details && (
                      <Fragment>
                        <li>
                          Trigger this command from chat:
                          <br /> <code>!{command.details.name}</code>
                        </li>
                        {command.details.message && (
                          <li>
                            When triggered, Stream Blitz will post the following
                            message in chat:
                            <br />
                            <code>{command.details.message}</code>
                          </li>
                        )}
                        {command.details.sfx && (
                          <li>
                            The following sound effect will play:
                            <br />
                            {/* TODO: how do we make user-submitted audio accessible? */}
                            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                            <audio
                              sx={{ mt: 2 }}
                              controls
                              src={command.details.sfx}
                            />
                          </li>
                        )}
                        {command.details.gif && (
                          <li>
                            The following image will appear on the overlay:
                            <br />
                            <img
                              sx={{ mt: 2, width: '100%' }}
                              src={command.details.gif}
                              alt=""
                            />
                          </li>
                        )}
                      </Fragment>
                    )}
                    {command.error && (
                      <li>
                        There was an error with this command handler.
                        Double-check your handler to make sure it returns a
                        valid command object. The error that came back was:{' '}
                        <code>{command.error}</code>
                      </li>
                    )}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p>no commands yet — let’s create one!</p>
        )}
      </div>
    )
  );
};

export default Commands;
