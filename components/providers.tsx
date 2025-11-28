'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { useState, useEffect, createContext, useContext } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

// Contexto para el estado del SDK de Farcaster
interface FarcasterContextType {
    isReady: boolean;
    isInMiniApp: boolean;
    user: {
        fid: number;
        username?: string;
        displayName?: string;
        pfpUrl?: string;
        custodyAddress?: string;
    } | null;
}

const FarcasterContext = createContext<FarcasterContextType>({
    isReady: false,
    isInMiniApp: false,
    user: null,
});

export const useFarcaster = () => useContext(FarcasterContext);

export function Providers({ children }: { children: React.ReactNode }) {
    const [config] = useState(() => createConfig({
        chains: [base],
        transports: {
            [base.id]: http(),
        },
        connectors: [
            farcasterMiniApp(),
        ],
    }));

    const [queryClient] = useState(() => new QueryClient());

    // Estado del SDK de Farcaster
    const [farcasterState, setFarcasterState] = useState<FarcasterContextType>({
        isReady: false,
        isInMiniApp: false,
        user: null,
    });

    useEffect(() => {
        const initFarcaster = async () => {
            try {
                // Detectar si estamos en un cliente Farcaster
                const isInMiniApp = typeof window !== 'undefined' &&
                    (window.location.search.includes('miniApp=true') ||
                     window.parent !== window);

                let user = null;

                if (isInMiniApp) {
                    const context = await sdk.context;
                    if (context?.user) {
                        // El SDK puede usar diferentes nombres para custody address
                        const userContext = context.user as {
                            fid: number;
                            username?: string;
                            displayName?: string;
                            pfpUrl?: string;
                            custodyAddress?: string;
                            custody_address?: string;
                        };

                        user = {
                            fid: userContext.fid,
                            username: userContext.username,
                            displayName: userContext.displayName,
                            pfpUrl: userContext.pfpUrl,
                            custodyAddress: userContext.custodyAddress || userContext.custody_address,
                        };
                    }
                }

                // CRITICO: Llamar ready() para ocultar splash screen
                await sdk.actions.ready();

                setFarcasterState({
                    isReady: true,
                    isInMiniApp,
                    user,
                });
            } catch (error) {
                console.error('Error initializing Farcaster SDK:', error);
                // Marcamos como ready para no bloquear la app fuera de Farcaster
                setFarcasterState(prev => ({ ...prev, isReady: true }));
            }
        };

        initFarcaster();
    }, []);

    return (
        <FarcasterContext.Provider value={farcasterState}>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </WagmiProvider>
        </FarcasterContext.Provider>
    );
}
