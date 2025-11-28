'use client';

import { useEffect, useState, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterContext {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    custodyAddress?: string;
  };
  location?: {
    type: 'miniapp' | 'notification' | 'cast_share';
  };
}

export function useFarcasterSDK() {
  const [isReady, setIsReady] = useState(false);
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [isInMiniApp, setIsInMiniApp] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Detectar si estamos dentro de un cliente Farcaster
        const isMiniApp = typeof window !== 'undefined' &&
          (window.location.search.includes('miniApp=true') ||
           window.parent !== window);

        setIsInMiniApp(isMiniApp);

        if (isMiniApp) {
          // Obtener contexto antes de llamar ready
          const ctx = await sdk.context;
          setContext(ctx as FarcasterContext);
        }

        // CRITICO: Llamar ready() para ocultar splash screen
        await sdk.actions.ready();
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing Farcaster SDK:', error);
        // Aun asi marcamos como ready para no bloquear la app fuera de Farcaster
        setIsReady(true);
      }
    };

    init();
  }, []);

  const composeCast = useCallback(async (text: string, embeds?: string[]) => {
    if (!isInMiniApp) return;
    try {
      await sdk.actions.composeCast({
        text,
        embeds: embeds as [] | [string] | [string, string] | undefined,
      });
    } catch (error) {
      console.error('Error composing cast:', error);
    }
  }, [isInMiniApp]);

  const openUrl = useCallback(async (url: string) => {
    if (!isInMiniApp) {
      window.open(url, '_blank');
      return;
    }
    try {
      await sdk.actions.openUrl(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  }, [isInMiniApp]);

  const close = useCallback(async () => {
    if (!isInMiniApp) return;
    try {
      await sdk.actions.close();
    } catch (error) {
      console.error('Error closing miniapp:', error);
    }
  }, [isInMiniApp]);

  return {
    sdk,
    isReady,
    context,
    isInMiniApp,
    user: context?.user,
    composeCast,
    openUrl,
    close,
  };
}
