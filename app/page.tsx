'use client';

import { useState, useEffect, useCallback } from 'react';
import { Broadcaster } from '@/components/radio/Broadcaster';
import { Player } from '@/components/radio/Player';
import { useFarcaster } from '@/components/providers';
import { useWalletAddress } from '@/hooks/useWalletAddress';
import { generateRoomName, type RoomMetadata } from '@/lib/farcaster';
import { Loader2, Mic, Radio, Headphones } from 'lucide-react';
import Link from 'next/link';
import { MatrixBackground } from '@/components/MatrixBackground';

export default function Home() {
  const { isReady, user } = useFarcaster();
  const { address: walletAddress } = useWalletAddress();
  const [role, setRole] = useState<'broadcaster' | 'listener' | null>(null);
  const [roomName, setRoomName] = useState('');
  const [stationTitle, setStationTitle] = useState('');
  const [token, setToken] = useState('');
  const [roomMetadata, setRoomMetadata] = useState<RoomMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const username = user?.username || user?.displayName || `anon-${Math.floor(Math.random() * 1000)}`;
  const userFid = user?.fid || 0;

  // Función para unirse como listener
  const joinAsListener = useCallback(async (targetRoom: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener info de la sala para metadata
      const roomsRes = await fetch('/api/rooms');
      const roomsData = await roomsRes.json();
      const roomInfo = roomsData.rooms?.find((r: { name: string }) => r.name === targetRoom);

      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: targetRoom,
          username,
          role: 'listener',
          fid: userFid,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to join station');

      if (data.token) {
        setToken(data.token);
        setRoomName(targetRoom);
        setRoomMetadata(roomInfo?.metadata || null);
        setRole('listener');
        // Limpiar URL
        window.history.replaceState({}, '', '/');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join');
      window.history.replaceState({}, '', '/');
    } finally {
      setIsLoading(false);
    }
  }, [username, userFid]);

  // Detectar parámetro ?join= en la URL
  useEffect(() => {
    if (!isReady) return;

    const params = new URLSearchParams(window.location.search);
    const joinRoom = params.get('join');

    if (joinRoom) {
      joinAsListener(joinRoom);
    }
  }, [isReady, joinAsListener]);

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

  // Mostrar loading mientras se une a una sala
  if (isLoading) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-[#030014] bg-mesh">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
          <Loader2 className="relative w-10 h-10 animate-spin text-purple-400" />
        </div>
        <p className="mt-6 text-gray-400 text-sm">Joining station...</p>
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
        ownerUsername: isAnonymous ? 'anon' : user?.username,
        ownerDisplayName: isAnonymous ? 'Anonymous' : user?.displayName,
        ownerPfpUrl: isAnonymous ? undefined : user?.pfpUrl,
        ownerWallet: walletAddress,
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
    <main className="min-h-dvh bg-[#0a0a0f] text-white overflow-hidden relative flex flex-col">
      {/* Animated Background Pattern - Japanese characters */}
      <MatrixBackground />

      {/* Gradient Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-purple-600/25 via-fuchsia-500/15 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-tl from-pink-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-gradient-to-r from-indigo-500/10 to-transparent rounded-full blur-2xl" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-purple-500 blur-2xl opacity-30 animate-pulse" />
          <h1 className="relative text-5xl font-bold text-gradient tracking-tight">
            TuneIn
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-center text-gray-400 text-sm leading-relaxed max-w-[280px] mb-12">
          Create your own radio station and broadcast live to the{' '}
          <span className="text-purple-400 font-medium">Farcaster</span> community
        </p>

        {/* Error */}
        {error && (
          <div className="glass rounded-xl px-4 py-3 mb-4 border-red-500/30 bg-red-500/10">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Go Live Section */}
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="input-fancy">
            <Mic className="input-icon" />
            <input
              type="text"
              placeholder="Name your station..."
              value={stationTitle}
              onChange={(e) => setStationTitle(e.target.value)}
              maxLength={30}
            />
          </div>

          {/* Anonymous toggle */}
          <label className="cyberpunk-checkbox-label">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="cyberpunk-checkbox"
            />
            Broadcast anonymously
          </label>

          <button
            onClick={startBroadcasting}
            disabled={isLoading || !stationTitle.trim()}
            className="w-full btn-gradient"
          >
            <span>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Radio className="w-5 h-5" style={{ color: '#a855f7' }} />
                  Start Broadcasting
                </>
              )}
            </span>
          </button>

          <Link
            href="/explore"
            className="w-full btn-gradient"
          >
            <span>
              <Headphones className="w-5 h-5" style={{ color: '#a855f7' }} />
              Explore Stations
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
