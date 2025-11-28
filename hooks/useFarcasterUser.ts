'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custodyAddress?: string;
}

export function useFarcasterUser() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const context = await sdk.context;

        if (context?.user) {
          const userContext = context.user as {
            fid: number;
            username?: string;
            displayName?: string;
            pfpUrl?: string;
            custodyAddress?: string;
            custody_address?: string;
          };

          setUser({
            fid: userContext.fid,
            username: userContext.username,
            displayName: userContext.displayName,
            pfpUrl: userContext.pfpUrl,
            custodyAddress: userContext.custodyAddress || userContext.custody_address,
          });
        }
      } catch (err) {
        console.error('Error loading Farcaster user:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  return { user, isLoading, error };
}
