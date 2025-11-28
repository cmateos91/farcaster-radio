'use client';

import { Share2 } from 'lucide-react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useFarcaster } from '@/components/providers';

interface ShareButtonProps {
    roomName: string;
    title: string;
}

export function ShareButton({ roomName, title }: ShareButtonProps) {
    const { isInMiniApp } = useFarcaster();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    const handleShare = async () => {
        const shareUrl = `${appUrl}/listen/${roomName}`;
        const shareText = `Tune in to "${title}" on Farcaster Radio!`;

        if (isInMiniApp) {
            try {
                await sdk.actions.composeCast({
                    text: shareText,
                    embeds: [shareUrl] as [string],
                });
            } catch (error) {
                console.error('Error sharing to cast:', error);
            }
        } else {
            // Fallback: copiar al clipboard
            try {
                await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                alert('Link copied to clipboard!');
            } catch {
                // Fallback para navegadores que no soportan clipboard API
                window.open(
                    `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(shareUrl)}`,
                    '_blank'
                );
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors"
            title="Share"
        >
            <Share2 className="w-5 h-5" />
        </button>
    );
}
