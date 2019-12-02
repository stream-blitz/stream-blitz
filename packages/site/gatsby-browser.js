import React, { useEffect, useState } from 'react';
import { silentAuth } from './src/utils/auth';

const SessionCheck = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    silentAuth(() => setLoading(false));
  }, [loading]);

  return !loading && <>{children}</>;
};

export const wrapRootElement = ({ element }) => (
  <SessionCheck>{element}</SessionCheck>
);
