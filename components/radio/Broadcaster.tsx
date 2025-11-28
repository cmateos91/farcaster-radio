'use client';

import { LiveKitRoom, RoomAudioRenderer, ControlBar, useRemoteParticipants, useLocalParticipant, StartAudio } from '@livekit/components-react';
import '@livekit/components-styles';
import { AudioVisualizer } from './Visualizer';
import { ShareButton } from './ShareButton';
import { Mic, MicOff, X, Users, Radio } from 'lucide-react';
import { type RoomMetadata } from '@/lib/farcaster';
import { RoomOptions, AudioPresets } from 'livekit-client';
import { useEffect, useState } from 'react';

// Opciones optimizadas para voz - simplificadas para mejor compatibilidad móvil
const roomOptions: RoomOptions = {
  audioCaptureDefaults: {
    autoGainControl: true,
    echoCancellation: true,
    noiseSuppression: true,
  },
  publishDefaults: {
    audioPreset: AudioPresets.speech,
    dtx: true,
    red: true,
  },
};

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
    const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
    const listenerCount = participants.length;
    const [micError, setMicError] = useState<string | null>(null);

    // Activar micrófono explícitamente al conectar (importante para móvil)
    useEffect(() => {
        const enableMic = async () => {
            if (localParticipant && !isMicrophoneEnabled) {
                try {
                    await localParticipant.setMicrophoneEnabled(true);
                    setMicError(null);
                } catch (error) {
                    console.error('Error enabling microphone:', error);
                    setMicError('Could not access microphone');
                }
            }
        };

        // Pequeño delay para asegurar que la conexión está establecida
        const timer = setTimeout(enableMic, 500);
        return () => clearTimeout(timer);
    }, [localParticipant, isMicrophoneEnabled]);

    return (
        <div className="min-h-dvh bg-[#030014] bg-mesh text-white overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-red-500/10 rounded-full blur-[100px] sm:blur-[150px]" />
                <div className="absolute bottom-1/4 right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-purple-500/10 rounded-full blur-[80px] sm:blur-[120px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-dvh px-4 sm:px-5 py-4 sm:py-6 safe-top safe-bottom">
                {/* Header */}
                <header className="flex items-center justify-between mb-4 sm:mb-6">
                    <button
                        onClick={onLeave}
                        className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {micError ? (
                        <div className="glass rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2">
                            <MicOff className="w-3 h-3 text-red-500" />
                            <span className="text-xs sm:text-sm font-semibold text-red-400">MIC ERROR</span>
                        </div>
                    ) : isMicrophoneEnabled ? (
                        <div className="glass rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 animate-pulse">
                            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-red-500 rounded-full" />
                            <span className="text-xs sm:text-sm font-semibold text-red-400">ON AIR</span>
                        </div>
                    ) : (
                        <div className="glass rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2">
                            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-yellow-500 rounded-full animate-pulse" />
                            <span className="text-xs sm:text-sm font-semibold text-yellow-400">CONNECTING...</span>
                        </div>
                    )}

                    <ShareButton roomName={roomName} title={metadata.title} />
                </header>

                {/* Main content */}
                <div className="flex-1 flex flex-col items-center justify-center py-4">
                    {/* Station info */}
                    <div className="text-center mb-6 sm:mb-8 px-4">
                        <h1 className="text-xl sm:text-2xl font-bold mb-1 text-gradient truncate max-w-[280px] sm:max-w-none">
                            {metadata.title}
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm">
                            @{metadata.ownerUsername || 'anonymous'}
                        </p>
                    </div>

                    {/* Mic icon with glow */}
                    <div className="relative mb-6 sm:mb-8">
                        <div className={`absolute inset-0 bg-gradient-to-br ${isMicrophoneEnabled ? 'from-red-500 to-pink-500' : 'from-gray-500 to-gray-600'} rounded-full blur-2xl sm:blur-3xl opacity-40 scale-125 sm:scale-150`} />
                        <button
                            onClick={async () => {
                                if (localParticipant) {
                                    try {
                                        await localParticipant.setMicrophoneEnabled(true);
                                        setMicError(null);
                                    } catch (error) {
                                        console.error('Error enabling microphone:', error);
                                        setMicError('Could not access microphone');
                                    }
                                }
                            }}
                            className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${isMicrophoneEnabled ? 'from-red-500/20 to-pink-500/20 border-red-500/30' : 'from-gray-500/20 to-gray-600/20 border-gray-500/30'} flex items-center justify-center border ${isMicrophoneEnabled ? 'animate-pulse-glow' : ''}`}
                        >
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${isMicrophoneEnabled ? 'from-red-500 to-pink-500' : 'from-gray-500 to-gray-600'} flex items-center justify-center shadow-2xl`}>
                                {isMicrophoneEnabled ? (
                                    <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                ) : (
                                    <MicOff className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                )}
                            </div>
                        </button>
                        {!isMicrophoneEnabled && (
                            <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-yellow-400 whitespace-nowrap">
                                Tap to enable mic
                            </p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="glass rounded-2xl px-5 sm:px-6 py-3 sm:py-4 flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                            <span className="font-bold text-lg sm:text-xl">{listenerCount}</span>
                            <span className="text-gray-400 text-xs sm:text-sm">listening</span>
                        </div>
                    </div>

                    {/* Visualizer */}
                    <div className="w-full max-w-[320px] sm:max-w-sm glass rounded-2xl p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-2">
                                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                                <span className="text-xs sm:text-sm text-gray-400">Audio Signal</span>
                            </div>
                            <span className="text-[10px] sm:text-xs text-green-400 font-mono">LIVE</span>
                        </div>
                        <AudioVisualizer />
                    </div>
                </div>

                {/* Bottom controls */}
                <div className="mt-auto pt-4 sm:pt-6">
                    <div className="glass rounded-2xl sm:rounded-3xl p-2 sm:p-3">
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
            </div>

            <RoomAudioRenderer />
            <StartAudio label="Click to enable audio" />
        </div>
    );
}

export function Broadcaster({ roomName, username, token, serverUrl, metadata, onLeave }: BroadcasterProps) {
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
            options={roomOptions}
            data-lk-theme="default"
            style={{ height: '100dvh' }}
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
