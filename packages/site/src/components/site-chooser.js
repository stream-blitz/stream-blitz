/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useState } from 'react';
import Card from './card';

const SiteChooser = ({ state, send }) => {
  const [searchString, setSearchString] = useState('');

  const sites = state.context.sites.filter(({ url }) =>
    url.match(new RegExp(searchString)),
  );

  return (
    <Card>
      <h2>Choose the site where your effects are deployed</h2>
      <p>
        Stream Blitz effects are serverless functions deployed to Netlify. For
        more information,{' '}
        <a href="https://streamblitz.com/docs/quickstart">
          read the quickstart
        </a>
        .
      </p>
      <form>
        <label
          htmlFor="filter"
          sx={{ display: 'block', fontWeight: 800, mt: 4 }}
        >
          Start typing to filter your sites
        </label>
        <input
          type="text"
          value={searchString}
          onChange={e => setSearchString(e.target.value)}
          sx={{
            border: t => `1px solid ${t.colors.ghost}`,
            borderRadius: 5,
            display: 'block',
            fontSize: 2,
            mb: 4,
            mt: 2,
            p: 3,
            width: '100%',
          }}
        />

        <h3>Your Netlify sites:</h3>
        <p>Click a site below to set it as your source of effects.</p>
        {sites.map(({ id, url }) => (
          <button
            key={id}
            onClick={event => {
              event.preventDefault();
              send('SET_SITE_ID', { site: id });
            }}
            sx={{
              bg: 'background',
              border: t => `1px solid ${t.colors.ghost}`,
              borderRadius: 5,
              display: 'block',
              fontSize: 2,
              my: 3,
              p: 2,
              ':hover,:active': {
                bg: 'ghost',
                cursor: 'pointer',
              },
            }}
          >
            {url}
          </button>
        ))}
      </form>
    </Card>
  );
};

export default SiteChooser;
