'use client';

import { useSendTransaction, useAccount, useConnect } from 'wagmi';
import { parseEther } from 'viem';
import { Loader2 } from 'lucide-react';

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
            value: parseEther('0.001'), // ~ $3-4 USD
        });
    };

    return (
        <button
            onClick={handleDonate}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-pink-500/30"
        >
            {isPending ? <Loader2 className="animate-spin" /> : '🎁'}
            Donate 0.001 ETH
        </button>
    );
}
