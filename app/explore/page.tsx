'use client';

import { useState, useEffect } from 'react';
import { useFarcaster } from '@/components/providers';
import { type RoomMetadata } from '@/lib/farcaster';
import { Radio, Users, Loader2, RefreshCw, ArrowLeft, Headphones } from 'lucide-react';
import Link from 'next/link';

interface RoomInfo {
    name: string;
    metadata: RoomMetadata | null;
    numParticipants: number;
    createdAt: number;
}

export default function ExplorePage() {
    const { isReady, user } = useFarcaster();
    const [rooms, setRooms] = useState<RoomInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRooms = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/rooms');
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch rooms');
            }

            setRooms(data.rooms || []);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'Failed to load stations');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isReady) {
            fetchRooms();
        }
    }, [isReady]);

    // Auto-refresh cada 30 segundos
    useEffect(() => {
        const interval = setInterval(fetchRooms, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!isReady) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4 bg-gradient-to-b from-gray-900 to-black text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Link
                    href="/"
                    className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <h1 className="text-xl font-bold">Live Stations</h1>

                <button
                    onClick={fetchRooms}
                    disabled={isLoading}
                    className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Lista de estaciones */}
            {isLoading && rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
                    <p className="text-gray-400">Loading stations...</p>
                </div>
            ) : rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Radio className="w-16 h-16 text-gray-600 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-400 mb-2">No stations live</h2>
                    <p className="text-gray-500 mb-6">Be the first to start broadcasting!</p>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold"
                    >
                        Start Your Station
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {rooms.map((room) => (
                        <StationCard key={room.name} room={room} />
                    ))}
                </div>
            )}
        </main>
    );
}

function StationCard({ room }: { room: RoomInfo }) {
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async () => {
        setIsJoining(true);
        // Redirigir a la pagina principal con parametros para unirse
        window.location.href = `/?join=${encodeURIComponent(room.name)}`;
    };

    return (
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-start gap-4">
                {/* Avatar del broadcaster */}
                {room.metadata?.ownerPfpUrl ? (
                    <img
                        src={room.metadata.ownerPfpUrl}
                        alt=""
                        className="w-14 h-14 rounded-full border-2 border-purple-500"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
                        <Radio className="w-6 h-6 text-gray-400" />
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">
                        {room.metadata?.title || 'Untitled Station'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                        @{room.metadata?.ownerUsername || 'anonymous'}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Users className="w-3 h-3" />
                            {room.numParticipants} listening
                        </span>
                        <span className="flex items-center gap-1 text-xs text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            LIVE
                        </span>
                    </div>
                </div>

                {/* Boton de unirse */}
                <button
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
                >
                    {isJoining ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <Headphones className="w-4 h-4" />
                            Tune In
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
