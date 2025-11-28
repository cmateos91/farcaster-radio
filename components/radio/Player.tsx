'use client';

import { LiveKitRoom, RoomAudioRenderer, useTracks, useRemoteParticipants } from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { DonationButton } from '@/components/wallet/DonationButton';
import { ShareButton } from './ShareButton';
import { AudioVisualizer } from './Visualizer';
import { type RoomMetadata } from '@/lib/farcaster';
import { X, Radio, Users, Volume2, VolumeX } from 'lucide-react';
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

    // Obtener wallet del broadcaster desde metadata
    const broadcasterWallet = metadata?.ownerWallet as `0x${string}` | undefined;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-black text-white">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <button
                    onClick={onLeave}
                    className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {isLive ? (
                    <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/50">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-bold text-green-500 text-sm">LIVE</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/50">
                        <span className="text-yellow-500 text-sm">Waiting...</span>
                    </div>
                )}

                {metadata && (
                    <ShareButton roomName={metadata.title} title={metadata.title} />
                )}
            </div>

            {/* Info del broadcaster */}
            <div className="text-center space-y-3 mt-16">
                {metadata?.ownerPfpUrl && (
                    <img
                        src={metadata.ownerPfpUrl}
                        alt=""
                        className="w-20 h-20 rounded-full mx-auto border-4 border-purple-500 shadow-lg shadow-purple-500/30"
                    />
                )}
                <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    {metadata?.title || 'Farcaster Radio'}
                </h1>
                <p className="text-gray-400 font-medium">
                    Hosted by @{metadata?.ownerUsername || 'anonymous'}
                </p>
            </div>

            {/* Visualizador */}
            <div className="w-full max-w-md px-4 my-8">
                <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
                    <AudioVisualizer />
                </div>
            </div>

            {/* Stats y controles */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400 bg-gray-800/30 px-4 py-2 rounded-full">
                    <Users className="w-4 h-4" />
                    <span className="font-bold text-white">{listenerCount + 1}</span>
                </div>

                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full transition-colors ${
                        isMuted
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-800/50 text-white'
                    }`}
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
            </div>

            {/* Boton de donacion */}
            {broadcasterWallet && (
                <div className="mt-8">
                    <DonationButton recipientAddress={broadcasterWallet} />
                </div>
            )}

            {!broadcasterWallet && (
                <p className="mt-8 text-xs text-gray-600">
                    Donations not available - broadcaster wallet not set
                </p>
            )}

            <RoomAudioRenderer muted={isMuted} />
        </div>
    );
}

export function Player({ roomName, username, token, serverUrl, metadata, onLeave }: PlayerProps) {
    return (
        <LiveKitRoom
            video={false}
            audio={true}
            token={token}
            serverUrl={serverUrl}
            data-lk-theme="default"
            style={{ height: '100vh' }}
            onDisconnected={onLeave}
        >
            <PlayerContent metadata={metadata} onLeave={onLeave} />
        </LiveKitRoom>
    );
}
