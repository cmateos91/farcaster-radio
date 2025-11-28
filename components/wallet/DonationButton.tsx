'use client';

import { useSendTransaction, useAccount, useConnect } from 'wagmi';
import { parseEther } from 'viem';
import { Loader2, Gift } from 'lucide-react';

export function DonationButton({ recipientAddress }: { recipientAddress: `0x${string}` }) {
    const { isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { sendTransaction, isPending } = useSendTransaction();

    const handleDonate = () => {
        if (!isConnected) {
            const connector = connectors.find(c => c.id === 'farcaster-frame');
            if (connector) {
                connect({ connector });
            }
            return;
        }

        sendTransaction({
            to: recipientAddress,
            value: parseEther('0.001'),
        });
    };

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
                        <Gift className="w-4 h-4" />
                        Send 0.001 ETH
                    </>
                )}
            </span>
        </button>
    );
}
