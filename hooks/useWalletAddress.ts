'use client';

import { useAccount, useConnect } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';

export function useWalletAddress() {
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const [hasAttempted, setHasAttempted] = useState(false);

    // Intentar conectar automáticamente al montar
    useEffect(() => {
        if (!isConnected && !hasAttempted && connectors.length > 0) {
            setHasAttempted(true);
            connect({ connector: connectors[0] });
        }
    }, [isConnected, hasAttempted, connectors, connect]);

    // Función para solicitar conexión manualmente
    const requestWallet = useCallback(() => {
        if (!isConnected && connectors.length > 0) {
            connect({ connector: connectors[0] });
        }
    }, [isConnected, connectors, connect]);

    return {
        address,
        isConnected,
        isPending,
        requestWallet,
    };
}
