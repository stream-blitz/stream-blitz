const TWITCH_CDN_URL = 'https://static-cdn.jtvnw.net/emoticons/v1';

exports.parseCommand = message => {
  const [cmd, ...args] = message.split(' ');
  const command = cmd.replace('!', '');

  return {
    command,
    args: args || [],
  };
};

exports.parseAuthor = (channel, meta) => ({
  id: meta['user-id'],
  username: meta['display-name'],
  roles: [
    meta.mod && 'MODERATOR',
    meta.subscriber && 'SUBSCRIBER',
    channel.replace('#', '').toLowerCase() ===
      meta['display-name'].toLowerCase() && 'BROADCASTER',
  ].filter(Boolean),
});

exports.parseEmotes = (message, emotesData) => {
  // loop through each emote used in this message
  const emotes = Object.entries(emotesData || {}).map(([id, locationsRaw]) => {
    // turn the array of ranges into an array of arrays with start/end indices
    const locations = locationsRaw.map(l => {
      const [start, end] = l.split('-');

      // for JS, substrings exclude the end index, so we need to bump by one
      return [parseInt(start), parseInt(end) + 1];
    });

    // get the start and end index for the first usage of this emote
    const [[start, end]] = locations;

    // pull out the emote name using the start and end indices
    const name = message.substring(start, end);

    return {
      id,
      name,
      locations,
      images: {
        small: `${TWITCH_CDN_URL}/${id}/1.0`,
        medium: `${TWITCH_CDN_URL}/${id}/2.0`,
        large: `${TWITCH_CDN_URL}/${id}/3.0`,
      },
    };
  });

  return emotes;
};

// some emotes include special characters — :) — so we escape them in our regex
const escapeRegExSpecialChars = string => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

exports.getMessageHTML = (message, emotes, size = 'medium') => {
  let html = message;

  emotes.map(emote => {
    const img = `<img src="${emote.images[size]}" alt="${emote.name}" />`;
    const safeName = new RegExp(escapeRegExSpecialChars(emote.name), 'g');
    html = html.replace(safeName, img);
  });

  return html;
};

/*
 * Subscriptions can be subs or resubs, and they can come from Prime or a
 * standard subscription via Twitch. To see the different data sent by tmi.js
 * for each type, check out this gist:
 * https://gist.github.com/jlengstorf/18b301d6df4c28d82aaf1182c6d2a62e
 */
exports.parseSubscription = () => {
  // TODO parse subscriptions
};
