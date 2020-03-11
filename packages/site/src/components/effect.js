/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Fragment } from 'react';
import { useMachine } from '@xstate/react';
import effectMachine from '../state-machines/effect';

const Effect = ({ publicURL, effect, channel, userID }) => {
  const [state] = useMachine(
    effectMachine.withContext({
      channel,
      userID,
      url: publicURL,
      name: effect,
    }),
  );

  if (state.matches('invalid') || state.matches('failure')) {
    // TODO add docs
    return null;
  }

  if (state.matches('success')) {
    const {
      name,
      message,
      description,
      audio,
      image,
      duration,
    } = state.context;

    return (
      <div
        sx={{
          pb: 4,
          mt: 3,
          borderBottom: t => `1px solid ${t.colors.ghost}`,
        }}
      >
        <h3 sx={{ m: 0 }}>!{name}</h3>
        <p>{description}</p>
        <details>
          <summary>Effect Details</summary>
          <dl>
            <dt>Chat Message</dt>
            <dd>{message}</dd>
            <dt>Description</dt>
            <dd>{description}</dd>
            {image && (
              <Fragment>
                <dt>Image</dt>
                <dd>
                  <img src={image} alt="" style={{ width: 200 }} />
                </dd>
              </Fragment>
            )}
            {audio && (
              <Fragment>
                <dt>Audio</dt>
                <dd>
                  {/* TODO: how do we make user-submitted audio accessible? */}
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio controls src={audio} />
                </dd>
              </Fragment>
            )}
            {duration && (
              <Fragment>
                <dt>Duration</dt>
                <dd>{duration}</dd>
              </Fragment>
            )}
          </dl>
        </details>
      </div>
    );
  }

  return null;
};

export default Effect;
