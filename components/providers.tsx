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
                // Primero intentamos obtener el contexto del SDK
                const context = await sdk.context;

                console.log('Farcaster SDK context:', context);

                let user = null;
                let isInMiniApp = false;

                if (context?.user) {
                    isInMiniApp = true;

                    const u = context.user;

                    // Intentar obtener la wallet del usuario via el provider
                    let walletAddress: string | undefined;
                    try {
                        const provider = await sdk.wallet.getEthereumProvider();
                        if (provider) {
                            const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
                            if (accounts && accounts.length > 0) {
                                walletAddress = accounts[0];
                            }
                        }
                    } catch (e) {
                        console.log('Could not get wallet:', e);
                    }

                    user = {
                        fid: u.fid,
                        username: u.username,
                        displayName: u.displayName || u.username,
                        pfpUrl: u.pfpUrl,
                        custodyAddress: walletAddress,
                    };

                    console.log('Farcaster user detected:', user);
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
                try {
                    await sdk.actions.ready();
                } catch {
                    // Ignorar si falla
                }
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
