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
                <div className="absolute top-0 right-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-purple-500/10 rounded-full blur-[80px] sm:blur-[120px]" />
                <div className="absolute bottom-1/4 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-pink-500/10 rounded-full blur-[70px] sm:blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-dvh px-4 sm:px-5 py-4 sm:py-6 safe-top safe-bottom">
                {/* Header */}
                <header className="flex items-center justify-between mb-6 sm:mb-8">
                    <Link
                        href="/"
                        className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>

                    <h1 className="font-bold text-base sm:text-lg">Live Stations</h1>

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
                    <div className="glass rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 mb-4 sm:mb-6 border-red-500/30 bg-red-500/10">
                        <p className="text-red-400 text-xs sm:text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Content */}
                {isLoading && rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-purple-400 mb-3 sm:mb-4" />
                        <p className="text-gray-400 text-xs sm:text-sm">Finding stations...</p>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
                        <div className="relative mb-5 sm:mb-6">
                            <div className="absolute inset-0 bg-purple-500/20 blur-2xl sm:blur-3xl rounded-full" />
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 glass rounded-full flex items-center justify-center">
                                <Wifi className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                            </div>
                        </div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">No stations live</h2>
                        <p className="text-gray-500 text-xs sm:text-sm mb-5 sm:mb-6 max-w-[220px] sm:max-w-[240px]">
                            Be the first to start broadcasting!
                        </p>
                        <Link
                            href="/"
                            className="btn-gradient btn-gradient-sm"
                        >
                            <span>Start Your Station</span>
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
        <div className="glass rounded-2xl p-3 sm:p-4 hover:bg-white/[0.07] transition-all active:scale-[0.99]">
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Avatar */}
                {room.metadata?.ownerPfpUrl ? (
                    <img
                        src={room.metadata.ownerPfpUrl}
                        alt=""
                        className="rounded-xl border-2 border-purple-500/30 object-cover flex-shrink-0"
                        style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px' }}
                    />
                ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20 flex-shrink-0">
                        <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">
                        {room.metadata?.title || 'Untitled'}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">
                        @{room.metadata?.ownerUsername || 'anonymous'}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
                        <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {room.numParticipants}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] sm:text-xs text-green-400">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            LIVE
                        </span>
                    </div>
                </div>

                {/* Join button */}
                <button
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="btn-gradient btn-gradient-sm flex-shrink-0"
                >
                    <span className="!py-2 !px-3 sm:!py-2.5 sm:!px-4">
                        {isJoining ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Headphones className="w-4 h-4" />
                                <span className="hidden sm:inline">Join</span>
                            </>
                        )}
                    </span>
                </button>
            </div>
        </div>
    );
}
