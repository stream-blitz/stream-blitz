/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useState } from 'react';
import { post } from '../utils/api';
import { getProfile } from '../utils/auth';

const INITIAL_VALUES = { name: '', handler: '' };
const CreateCommand = ({ send }) => {
  const [values, setValues] = useState(INITIAL_VALUES);

  const handleInput = event => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = event => {
    event.preventDefault();

    const { name } = getProfile();

    post(`${process.env.STREAM_BLITZ_API}/commands/create`, {
      ...values,
      channel: name,
    }).then(() => {
      send('RELOAD');
      setValues(INITIAL_VALUES);
    });
  };

  const Field = ({ name, label, description, type }) => (
    <div sx={{ display: 'block' }}>
      <label htmlFor={name} sx={{ display: 'block', fontWeight: 'bold' }}>
        {label}
      </label>
      <p sx={{ fontSize: 1, color: 'muted', my: 2 }}>{description}</p>
      <input
        id={name}
        name={name}
        type={type}
        value={values[name]}
        onChange={handleInput}
        sx={{
          border: t => `1px solid ${t.colors.primary}`,
          borderRadius: 3,
          fontSize: 2,
          mb: 3,
          p: 2,
          width: '100%',
        }}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register a New Chat Command</h2>

      <Field
        name="name"
        type="text"
        label="Command Name"
        description="This is what people will type in chat to trigger this command."
      />

      <Field
        name="handler"
        type="url"
        label="Handler Function URL"
        description="URL of a serverless function or other endpoint that returns a valid command object."
      />

      <button
        type="submit"
        sx={{
          display: 'block',
          bg: 'primary',
          border: t => `1px solid ${t.colors.primary}`,
          borderRadius: 3,
          color: 'background',
          fontSize: 2,
          fontWeight: 'bold',
          p: 2,
        }}
      >
        Save Command
      </button>
    </form>
  );
};

export default CreateCommand;
