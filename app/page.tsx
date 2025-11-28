'use client';

import { useState, useEffect } from 'react';
import { Broadcaster } from '@/components/radio/Broadcaster';
import { Player } from '@/components/radio/Player';
import { useFarcaster } from '@/components/providers';
import { generateRoomName, type RoomMetadata } from '@/lib/farcaster';
import { Radio, Headphones, Users, Loader2 } from 'lucide-react';

export default function Home() {
  const { isReady, user, isInMiniApp } = useFarcaster();
  const [role, setRole] = useState<'broadcaster' | 'listener' | null>(null);
  const [roomName, setRoomName] = useState('');
  const [stationTitle, setStationTitle] = useState('');
  const [token, setToken] = useState('');
  const [roomMetadata, setRoomMetadata] = useState<RoomMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Username: usar datos de Farcaster o generar uno aleatorio
  const username = user?.username || user?.displayName || `anon-${Math.floor(Math.random() * 1000)}`;
  const userFid = user?.fid || 0;

  // Si no esta listo el SDK, mostrar loading
  if (!isReady) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="mt-4 text-gray-400">Loading...</p>
      </main>
    );
  }

  const startBroadcasting = async () => {
    if (!stationTitle.trim()) {
      setError('Please enter a station name');
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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create station');
      }

      if (data.token) {
        setToken(data.token);
        setRoomMetadata(metadata);
        setRole('broadcaster');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Failed to start broadcasting');
    } finally {
      setIsLoading(false);
    }
  };

  const joinAsListener = async (targetRoom: string, metadata?: RoomMetadata) => {
    setIsLoading(true);
    setError(null);

    try {
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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join station');
      }

      if (data.token) {
        setToken(data.token);
        setRoomName(targetRoom);
        setRoomMetadata(metadata || null);
        setRole('listener');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Failed to join station');
    } finally {
      setIsLoading(false);
    }
  };

  // Vista de broadcaster
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

  // Vista de listener
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
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header con info del usuario */}
      {user && (
        <div className="absolute top-4 right-4 flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-full">
          {user.pfpUrl && (
            <img src={user.pfpUrl} alt="" className="w-8 h-8 rounded-full" />
          )}
          <span className="text-sm text-gray-300">@{user.username}</span>
        </div>
      )}

      {/* Logo y titulo */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg shadow-purple-500/30">
          <Radio className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Farcaster Radio
        </h1>
        <p className="text-gray-400">Your voice, your station</p>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Seccion para crear estacion */}
      <div className="w-full max-w-md space-y-6">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            Start Your Station
          </h2>

          <input
            type="text"
            placeholder="Station name..."
            value={stationTitle}
            onChange={(e) => setStationTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-4"
            maxLength={30}
          />

          <button
            onClick={startBroadcasting}
            disabled={isLoading || !stationTitle.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Radio className="w-5 h-5" />
                Go Live
              </>
            )}
          </button>
        </div>

        {/* Link a explorar estaciones */}
        <a
          href="/explore"
          className="block w-full px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl font-semibold transition-all text-center"
        >
          <span className="flex items-center justify-center gap-2">
            <Headphones className="w-5 h-5 text-pink-400" />
            Explore Stations
          </span>
        </a>
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-gray-600">
        {isInMiniApp ? 'Running inside Farcaster' : 'Open in Warpcast for full experience'}
      </p>
    </main>
  );
}
