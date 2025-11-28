'use client';

import { LiveKitRoom, RoomAudioRenderer, ControlBar, useRemoteParticipants } from '@livekit/components-react';
import '@livekit/components-styles';
import { AudioVisualizer } from './Visualizer';
import { ShareButton } from './ShareButton';
import { Mic, X, Users, Share2 } from 'lucide-react';
import { type RoomMetadata } from '@/lib/farcaster';

interface BroadcasterProps {
    roomName: string;
    username: string;
    token: string;
    serverUrl: string;
    metadata: RoomMetadata;
    onLeave: () => void;
}

function BroadcasterContent({
    roomName,
    metadata,
    onLeave
}: {
    roomName: string;
    metadata: RoomMetadata;
    onLeave: () => void;
}) {
    const participants = useRemoteParticipants();
    const listenerCount = participants.length;

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

                <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/50 animate-pulse">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="font-bold text-red-500 tracking-wider text-sm">ON AIR</span>
                </div>

                <ShareButton roomName={roomName} title={metadata.title} />
            </div>

            {/* Info de la estacion */}
            <div className="text-center space-y-2 mt-16">
                <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    {metadata.title}
                </h1>
                <p className="text-gray-400 font-medium">
                    @{metadata.ownerUsername || 'anonymous'}
                </p>
            </div>

            {/* Icono del microfono */}
            <div className="relative group my-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <div className="relative p-8 bg-black rounded-full border-4 border-gray-800">
                    <Mic className="w-16 h-16 text-white" />
                </div>
            </div>

            {/* Visualizador y stats */}
            <div className="flex flex-col items-center gap-4 w-full max-w-md px-4">
                <div className="w-full bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Signal</span>
                        <span className="text-green-400 text-sm font-mono">LIVE</span>
                    </div>
                    <AudioVisualizer />
                </div>

                <div className="flex items-center gap-2 text-gray-400 bg-gray-800/30 px-6 py-3 rounded-full">
                    <Users className="w-5 h-5" />
                    <span className="font-bold text-white text-lg">{listenerCount}</span>
                    <span>Listeners</span>
                </div>
            </div>

            {/* Controles de microfono */}
            <div className="fixed bottom-8 w-full max-w-md px-4">
                <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-2 border border-gray-800 shadow-2xl">
                    <ControlBar
                        variation="minimal"
                        controls={{
                            microphone: true,
                            camera: false,
                            screenShare: false,
                            chat: false,
                            leave: false,
                        }}
                    />
                </div>
            </div>

            <RoomAudioRenderer />
        </div>
    );
}

export function Broadcaster({ roomName, username, token, serverUrl, metadata, onLeave }: BroadcasterProps) {
    // Enviar notificaciones cuando se conecta
    const handleConnected = async () => {
        try {
            await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    broadcasterUsername: metadata.ownerUsername || 'anonymous',
                    stationTitle: metadata.title,
                    roomName,
                }),
            });
        } catch (error) {
            console.error('Failed to send notifications:', error);
        }
    };

    return (
        <LiveKitRoom
            video={false}
            audio={true}
            token={token}
            serverUrl={serverUrl}
            data-lk-theme="default"
            style={{ height: '100vh' }}
            onDisconnected={onLeave}
            onConnected={handleConnected}
        >
            <BroadcasterContent
                roomName={roomName}
                metadata={metadata}
                onLeave={onLeave}
            />
        </LiveKitRoom>
    );
}
