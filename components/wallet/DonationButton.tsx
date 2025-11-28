'use client';

import { useSendTransaction, useAccount, useConnect } from 'wagmi';
import { parseEther } from 'viem';
import { Loader2, Gift } from 'lucide-react';
import { useEffect } from 'react';

export function DonationButton({ recipientAddress }: { recipientAddress: `0x${string}` }) {
    const { isConnected } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { sendTransaction, isPending: isSending } = useSendTransaction();

    // Auto-conectar al montar si no está conectado
    useEffect(() => {
        if (!isConnected && connectors.length > 0) {
            connect({ connector: connectors[0] });
        }
    }, [isConnected, connectors, connect]);

    const handleDonate = () => {
        if (!isConnected) {
            // Intentar conectar con el primer conector disponible
            if (connectors.length > 0) {
                connect({ connector: connectors[0] });
            }
            return;
        }

        sendTransaction({
            to: recipientAddress,
            value: parseEther('0.001'),
        });
    };

    const isPending = isConnecting || isSending;

    return (
        <button
            onClick={handleDonate}
            disabled={isPending}
            className="w-full btn-gradient"
        >
            <span>
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        <Gift className="w-4 h-4" style={{ color: '#ec4899' }} />
                        {isConnected ? 'Send 0.001 ETH' : 'Connect & Donate'}
                    </>
                )}
            </span>
        </button>
    );
}
