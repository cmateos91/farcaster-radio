'use client';

import { useSendCalls, useAccount, useConnect } from 'wagmi';
import { parseEther } from 'viem';
import { Loader2, Coins } from 'lucide-react';
import { useEffect } from 'react';

// Dev wallet for 10% fee
const DEV_WALLET = '0x7E04bF690E9458645DBc854Ef6606ccD90dC25F3' as const;

// Tip amounts
const TIP_AMOUNT = parseEther('0.0001');        // Total: 0.0001 ETH
const BROADCASTER_AMOUNT = parseEther('0.00009'); // 90% to broadcaster
const DEV_FEE = parseEther('0.00001');            // 10% to dev

export function TipButton({ recipientAddress }: { recipientAddress: `0x${string}` }) {
    const { isConnected } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { sendCalls, isPending: isSending } = useSendCalls();

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

        // Send batch transaction: 90% to broadcaster, 10% to dev
        sendCalls({
            calls: [
                {
                    to: recipientAddress,
                    value: BROADCASTER_AMOUNT,
                },
                {
                    to: DEV_WALLET,
                    value: DEV_FEE,
                },
            ],
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
