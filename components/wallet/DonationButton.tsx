'use client';

import { useSendTransaction, useAccount, useConnect } from 'wagmi';
import { parseEther } from 'viem';
import { Loader2, Coins } from 'lucide-react';
import { useEffect } from 'react';

export function TipButton({ recipientAddress }: { recipientAddress: `0x${string}` }) {
    const { isConnected } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { sendTransaction, isPending: isSending } = useSendTransaction();

    // Auto-conectar al montar si no está conectado
    useEffect(() => {
        if (!isConnected && connectors.length > 0) {
            connect({ connector: connectors[0] });
        }
    }, [isConnected, connectors, connect]);

    const handleTip = () => {
        if (!isConnected) {
            // Intentar conectar con el primer conector disponible
            if (connectors.length > 0) {
                connect({ connector: connectors[0] });
            }
            return;
        }

        sendTransaction({
            to: recipientAddress,
            value: parseEther('0.0001'),
        });
    };

    const isPending = isConnecting || isSending;

    return (
        <button
            onClick={handleTip}
            disabled={isPending}
            className="w-full btn-gradient"
        >
            <span>
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        <Coins className="w-4 h-4" style={{ color: '#ec4899' }} />
                        {isConnected ? 'Tip 0.0001 ETH' : 'Connect & Tip'}
                    </>
                )}
            </span>
        </button>
    );
}
