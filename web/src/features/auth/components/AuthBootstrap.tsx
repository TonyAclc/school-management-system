import { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/auth-store';
import { authStorage } from '../../../lib/auth-storage';
import { refreshAccessToken } from '../../../lib/api-client';

export const AuthBootstrap = ({ children }: { children: ReactNode }) => {
  const status = useAuthStore(s => s.status);
  const [didRun, setDidRun] = useState(false);

  useEffect(() => {
    if (didRun) return;
    setDidRun(true);

    void (async () => {
      const token = authStorage.getRefreshToken();
      if (!token) {
        useAuthStore.getState().clearSession();
        return;
      }
      const newToken = await refreshAccessToken();
      if (!newToken) {
        useAuthStore.getState().clearSession();
      }
    })();
  }, [didRun]);

  if (status === 'loading') {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div>Loading session...</div>
      </div>
    );
  }

  return <>{children}</>;
};
