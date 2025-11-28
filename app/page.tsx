'use client';

import { useState } from 'react';
import { Broadcaster } from '@/components/radio/Broadcaster';
import { Player } from '@/components/radio/Player';
import { useFarcaster } from '@/components/providers';
import { generateRoomName, type RoomMetadata } from '@/lib/farcaster';
import { Radio, Headphones, Loader2, Mic, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isReady, user, isInMiniApp } = useFarcaster();
  const [role, setRole] = useState<'broadcaster' | 'listener' | null>(null);
  const [roomName, setRoomName] = useState('');
  const [stationTitle, setStationTitle] = useState('');
  const [token, setToken] = useState('');
  const [roomMetadata, setRoomMetadata] = useState<RoomMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const username = user?.username || user?.displayName || `anon-${Math.floor(Math.random() * 1000)}`;
  const userFid = user?.fid || 0;

  if (!isReady) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-[#030014] bg-mesh">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
          <Loader2 className="relative w-10 h-10 animate-spin text-purple-400" />
        </div>
        <p className="mt-6 text-gray-400 text-sm">Loading...</p>
      </main>
    );
  }

  const startBroadcasting = async () => {
    if (!stationTitle.trim()) {
      setError('Enter a station name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generatedRoomName = generateRoomName(userFid, stationTitle);
      setRoomName(generatedRoomName);

      const metadata: RoomMetadata = {
        ownerFid: userFid,
        ownerUsername: user?.username,
        ownerDisplayName: user?.displayName,
        ownerPfpUrl: user?.pfpUrl,
        ownerWallet: user?.custodyAddress,
        title: stationTitle,
        createdAt: Date.now(),
      };

      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: generatedRoomName,
          username,
          role: 'broadcaster',
          fid: userFid,
          metadata,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create station');

      if (data.token) {
        setToken(data.token);
        setRoomMetadata(metadata);
        setRole('broadcaster');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start');
    } finally {
      setIsLoading(false);
    }
  };

  if (token && role === 'broadcaster' && roomMetadata) {
    return (
      <Broadcaster
        roomName={roomName}
        username={username}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
        metadata={roomMetadata}
        onLeave={() => {
          setToken('');
          setRole(null);
          setRoomMetadata(null);
        }}
      />
    );
  }

  if (token && role === 'listener') {
    return (
      <Player
        roomName={roomName}
        username={username}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
        metadata={roomMetadata}
        onLeave={() => {
          setToken('');
          setRole(null);
          setRoomMetadata(null);
        }}
      />
    );
  }

  return (
    <main className="min-h-dvh bg-[#030014] bg-mesh text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-dvh px-5 py-6 safe-top safe-bottom">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Radio</span>
          </div>

          {user && (
            <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
              {user.pfpUrl && (
                <img src={user.pfpUrl} alt="" className="w-6 h-6 rounded-full" />
              )}
              <span className="text-sm text-gray-300 max-w-[100px] truncate">
                @{user.username}
              </span>
            </div>
          )}
        </header>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center text-center mb-8">
          <div className="relative mb-6 animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-50" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl animate-pulse-glow">
              <Mic className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">
            <span className="text-gradient">Farcaster Radio</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-[260px]">
            Create your own radio station and broadcast live to the Farcaster community
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="glass rounded-xl px-4 py-3 mb-4 border-red-500/30 bg-red-500/10">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="glass rounded-3xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Go Live</span>
          </div>

          <input
            type="text"
            placeholder="Name your station..."
            value={stationTitle}
            onChange={(e) => setStationTitle(e.target.value)}
            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all text-base"
            maxLength={30}
          />

          <button
            onClick={startBroadcasting}
            disabled={isLoading || !stationTitle.trim()}
            className="w-full mt-4 py-4 rounded-2xl font-semibold text-base transition-all relative overflow-hidden group disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Radio className="w-5 h-5" />
                  Start Broadcasting
                </>
              )}
            </span>
          </button>
        </div>

        {/* Explore Link */}
        <Link
          href="/explore"
          className="glass rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.07] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="font-medium text-sm">Explore Stations</p>
              <p className="text-xs text-gray-500">Find live broadcasts</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-600">
          {isInMiniApp ? 'Running in Warpcast' : 'Open in Warpcast for full experience'}
        </p>
      </div>
    </main>
  );
}
