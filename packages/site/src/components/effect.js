import React from 'react';
import { useMachine } from '@xstate/react';
import effectMachine from '../state-machines/effect';

const Effect = ({ publicURL, effect, channel }) => {
  const [state] = useMachine(
    effectMachine.withContext({ channel, url: publicURL, name: effect }),
  );

  if (state.matches('invalid') || state.matches('failure')) {
    // TODO add docs
    return (
      <p>
        The serverless function {effect} is not a valid Stream Blitz effect. See
        the docs for more info.
      </p>
    );
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
      <div>
        <h3>!{name}</h3>
        <p>{description}</p>
        <details>
          <summary>Effect Details</summary>
          <dl>
            <dt>Chat Message</dt>
            <dd>{message}</dd>
            <dt>Description</dt>
            <dd>{description}</dd>
            {image && (
              <>
                <dt>Image</dt>
                <dd>
                  <img src={image} alt="" style={{ width: 200 }} />
                </dd>
              </>
            )}
            {audio && (
              <>
                <dt>Audio</dt>
                <dd>
                  {/* TODO: how do we make user-submitted audio accessible? */}
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio controls src={audio} />
                </dd>
              </>
            )}
            {duration && (
              <>
                <dt>Duration</dt>
                <dd>{duration}</dd>
              </>
            )}
          </dl>
        </details>
      </div>
    );
  }

  return <pre>{JSON.stringify(state, null, 2)}</pre>;
};

export default Effect;
