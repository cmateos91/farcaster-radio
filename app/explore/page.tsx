'use client';

import { useState, useEffect } from 'react';
import { useFarcaster } from '@/components/providers';
import { type RoomMetadata } from '@/lib/farcaster';
import { Radio, Users, Loader2, RefreshCw, ArrowLeft, Headphones, Wifi } from 'lucide-react';
import Link from 'next/link';

interface RoomInfo {
    name: string;
    metadata: RoomMetadata | null;
    numParticipants: number;
    createdAt: number;
}

export default function ExplorePage() {
    const { isReady } = useFarcaster();
    const [rooms, setRooms] = useState<RoomInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRooms = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/rooms');
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch');

            setRooms(data.rooms || []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isReady) fetchRooms();
    }, [isReady]);

    useEffect(() => {
        const interval = setInterval(fetchRooms, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!isReady) {
        return (
            <main className="flex min-h-dvh flex-col items-center justify-center bg-[#030014] bg-mesh">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </main>
        );
    }

    return (
        <main className="min-h-dvh bg-[#030014] bg-mesh text-white">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-dvh px-5 py-6 safe-top safe-bottom">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <Link
                        href="/"
                        className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>

                    <h1 className="font-bold text-lg">Live Stations</h1>

                    <button
                        onClick={fetchRooms}
                        disabled={isLoading}
                        className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </header>

                {/* Error */}
                {error && (
                    <div className="glass rounded-xl px-4 py-3 mb-6 border-red-500/30 bg-red-500/10">
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Content */}
                {isLoading && rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-4" />
                        <p className="text-gray-400 text-sm">Finding stations...</p>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
                            <div className="relative w-20 h-20 glass rounded-full flex items-center justify-center">
                                <Wifi className="w-10 h-10 text-gray-500" />
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-300 mb-2">No stations live</h2>
                        <p className="text-gray-500 text-sm mb-6 max-w-[240px]">
                            Be the first to start broadcasting!
                        </p>
                        <Link
                            href="/"
                            className="px-6 py-3 rounded-2xl font-semibold text-sm"
                            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
                        >
                            Start Your Station
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rooms.map((room) => (
                            <StationCard key={room.name} room={room} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

function StationCard({ room }: { room: RoomInfo }) {
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = () => {
        setIsJoining(true);
        window.location.href = `/?join=${encodeURIComponent(room.name)}`;
    };

    return (
        <div className="glass rounded-2xl p-4 hover:bg-white/[0.07] transition-all">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                {room.metadata?.ownerPfpUrl ? (
                    <img
                        src={room.metadata.ownerPfpUrl}
                        alt=""
                        className="rounded-xl border-2 border-purple-500/30 object-cover flex-shrink-0"
                        style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', maxWidth: '56px', maxHeight: '56px' }}
                    />
                ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
                        <Radio className="w-6 h-6 text-purple-400" />
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                        {room.metadata?.title || 'Untitled'}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">
                        @{room.metadata?.ownerUsername || 'anonymous'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            {room.numParticipants}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-green-400">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            LIVE
                        </span>
                    </div>
                </div>

                {/* Join button */}
                <button
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
                >
                    {isJoining ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <Headphones className="w-4 h-4" />
                            Join
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
