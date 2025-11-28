'use client';

import { LiveKitRoom, RoomAudioRenderer, useTracks, useRemoteParticipants } from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { DonationButton } from '@/components/wallet/DonationButton';
import { ShareButton } from './ShareButton';
import { AudioVisualizer } from './Visualizer';
import { type RoomMetadata } from '@/lib/farcaster';
import { X, Users, Volume2, VolumeX, Heart, Headphones } from 'lucide-react';
import { useState } from 'react';

interface PlayerProps {
    roomName: string;
    username: string;
    token: string;
    serverUrl: string;
    metadata: RoomMetadata | null;
    onLeave: () => void;
}

function PlayerContent({
    metadata,
    onLeave
}: {
    metadata: RoomMetadata | null;
    onLeave: () => void;
}) {
    const tracks = useTracks([Track.Source.Microphone]);
    const participants = useRemoteParticipants();
    const [isMuted, setIsMuted] = useState(false);

    const isLive = tracks.length > 0;
    const listenerCount = participants.length;
    const broadcasterWallet = metadata?.ownerWallet as `0x${string}` | undefined;

    return (
        <div className="min-h-dvh bg-[#030014] bg-mesh text-white overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-dvh px-5 py-6 safe-top safe-bottom">
                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <button
                        onClick={onLeave}
                        className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {isLive ? (
                        <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-green-400">LIVE</span>
                        </div>
                    ) : (
                        <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
                            <span className="text-sm text-yellow-400">Waiting...</span>
                        </div>
                    )}

                    {metadata && (
                        <ShareButton roomName={metadata.title} title={metadata.title} />
                    )}
                </header>

                {/* Main content */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Broadcaster info */}
                    <div className="relative mb-6">
                        {metadata?.ownerPfpUrl ? (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-40 scale-125" />
                                <img
                                    src={metadata.ownerPfpUrl}
                                    alt=""
                                    className="relative w-28 h-28 rounded-full border-4 border-purple-500/50 shadow-2xl"
                                />
                            </>
                        ) : (
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-40 scale-125" />
                                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                                    <Headphones className="w-12 h-12 text-purple-400" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold mb-1 text-gradient">
                            {metadata?.title || 'Farcaster Radio'}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Hosted by @{metadata?.ownerUsername || 'anonymous'}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span className="font-semibold">{listenerCount + 1}</span>
                        </div>

                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                                isMuted
                                    ? 'bg-red-500/20 border border-red-500/30'
                                    : 'glass'
                            }`}
                        >
                            {isMuted ? (
                                <VolumeX className="w-5 h-5 text-red-400" />
                            ) : (
                                <Volume2 className="w-5 h-5 text-white" />
                            )}
                        </button>
                    </div>

                    {/* Visualizer */}
                    <div className="w-full max-w-sm glass rounded-2xl p-5 mb-8">
                        <AudioVisualizer />
                    </div>

                    {/* Donation */}
                    {broadcasterWallet ? (
                        <div className="glass rounded-2xl p-4 w-full max-w-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <Heart className="w-4 h-4 text-pink-400" />
                                <span className="text-sm text-gray-300">Support the host</span>
                            </div>
                            <DonationButton recipientAddress={broadcasterWallet} />
                        </div>
                    ) : (
                        <p className="text-xs text-gray-600">
                            Donations not available
                        </p>
                    )}
                </div>
            </div>

            <RoomAudioRenderer muted={isMuted} />
        </div>
    );
}

export function Player({ token, serverUrl, metadata, onLeave }: PlayerProps) {
    return (
        <LiveKitRoom
            video={false}
            audio={true}
            token={token}
            serverUrl={serverUrl}
            data-lk-theme="default"
            style={{ height: '100dvh' }}
            onDisconnected={onLeave}
        >
            <PlayerContent metadata={metadata} onLeave={onLeave} />
        </LiveKitRoom>
    );
}
