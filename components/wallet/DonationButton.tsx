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
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    <Gift className="w-4 h-4" />
                    Send 0.001 ETH
                </>
            )}
        </button>
    );
}
