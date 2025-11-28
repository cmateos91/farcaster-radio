'use client';

import { useState, useEffect, useCallback } from 'react';
import { Broadcaster } from '@/components/radio/Broadcaster';
import { Player } from '@/components/radio/Player';
import { useFarcaster } from '@/components/providers';
import { generateRoomName, type RoomMetadata } from '@/lib/farcaster';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isReady, user } = useFarcaster();
  const [role, setRole] = useState<'broadcaster' | 'listener' | null>(null);
  const [roomName, setRoomName] = useState('');
  const [stationTitle, setStationTitle] = useState('');
  const [token, setToken] = useState('');
  const [roomMetadata, setRoomMetadata] = useState<RoomMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        {user && (
          <header className="flex justify-end mb-8">
            <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2">
              {user.pfpUrl && (
                <img
                  src={user.pfpUrl}
                  alt=""
                  className="rounded-full object-cover flex-shrink-0"
                  style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px', maxWidth: '24px', maxHeight: '24px' }}
                />
              )}
              <span className="text-sm text-gray-300 max-w-[100px] truncate">
                @{user.username}
              </span>
            </div>
          </header>
        )}

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center text-center mb-8">
          <div className="relative mb-6 animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-50" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl animate-pulse-glow">
              <svg className="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">
            <span className="text-gradient">TuneIn</span>
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

        {/* Go Live Section */}
        <div className="flex flex-col gap-6">
          <div className="input-fancy">
            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
            <input
              type="text"
              placeholder="Name your station..."
              value={stationTitle}
              onChange={(e) => setStationTitle(e.target.value)}
              maxLength={30}
            />
          </div>

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
                  <svg style={{width: '35px', height: '35px', flexShrink: 0}} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12C22 14.7578 20.8836 17.2549 19.0782 19.064M2 12C2 9.235 3.12222 6.73208 4.93603 4.92188M19.1414 5.00003C19.987 5.86254 20.6775 6.87757 21.1679 8.00003M5 19.1415C4.08988 18.2493 3.34958 17.1845 2.83209 16" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.2849 8.04397C17.3458 9.05877 18 10.4488 18 11.9822C18 13.5338 17.3302 14.9386 16.2469 15.9564M7.8 16C6.68918 14.9789 6 13.556 6 11.9822C6 10.4266 6.67333 9.01843 7.76162 8" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.6563 10.4511C14.5521 11.1088 15 11.4376 15 12C15 12.5624 14.5521 12.8912 13.6563 13.5489C13.4091 13.7304 13.1638 13.9014 12.9384 14.0438C12.7407 14.1688 12.5168 14.298 12.2849 14.4249C11.3913 14.914 10.9444 15.1586 10.5437 14.8878C10.1429 14.617 10.1065 14.0502 10.0337 12.9166C10.0131 12.596 10 12.2817 10 12C10 11.7183 10.0131 11.404 10.0337 11.0834C10.1065 9.94977 10.1429 9.38296 10.5437 9.1122C10.9444 8.84144 11.3913 9.08599 12.2849 9.57509C12.5168 9.70198 12.7407 9.83123 12.9384 9.95619C13.1638 10.0986 13.4091 10.2696 13.6563 10.4511Z" stroke="#ec4899" strokeWidth="1.5"/>
                  </svg>
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
              <svg style={{width: '35px', height: '35px', flexShrink: 0}} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.1807 11.8606C12.7807 11.8606 12.4207 11.6406 12.2507 11.2806L10.8007 8.39058L10.3807 9.17058C10.1507 9.60058 9.6907 9.87058 9.2007 9.87058H8.4707C8.0607 9.87058 7.7207 9.53058 7.7207 9.12058C7.7207 8.71058 8.0607 8.37058 8.4707 8.37058H9.1107L9.9007 6.91058C10.0907 6.57058 10.4707 6.34058 10.8307 6.36058C11.2207 6.36058 11.5707 6.59058 11.7507 6.93058L13.1807 9.79058L13.5207 9.10058C13.7507 8.64058 14.2007 8.36058 14.7207 8.36058H15.5307C15.9407 8.36058 16.2807 8.70058 16.2807 9.11058C16.2807 9.52058 15.9407 9.86058 15.5307 9.86058H14.8207L14.1107 11.2706C13.9307 11.6406 13.5807 11.8606 13.1807 11.8606Z" fill="#ec4899"/>
                <path d="M2.74982 18.6508C2.33982 18.6508 1.99982 18.3108 1.99982 17.9008V12.2008C1.94982 9.49078 2.95982 6.93078 4.83982 5.01078C6.71982 3.10078 9.23982 2.05078 11.9498 2.05078C17.4898 2.05078 21.9998 6.56078 21.9998 12.1008V17.8008C21.9998 18.2108 21.6598 18.5508 21.2498 18.5508C20.8398 18.5508 20.4998 18.2108 20.4998 17.8008V12.1008C20.4998 7.39078 16.6698 3.55078 11.9498 3.55078C9.63982 3.55078 7.49982 4.44078 5.90982 6.06078C4.30982 7.69078 3.45982 9.86078 3.49982 12.1808V17.8908C3.49982 18.3108 3.16982 18.6508 2.74982 18.6508Z" fill="#a855f7"/>
                <path d="M5.94 12.4492H5.81C3.71 12.4492 2 14.1592 2 16.2592V18.1392C2 20.2392 3.71 21.9492 5.81 21.9492H5.94C8.04 21.9492 9.75 20.2392 9.75 18.1392V16.2592C9.75 14.1592 8.04 12.4492 5.94 12.4492Z" fill="#a855f7"/>
                <path d="M18.19 12.4492H18.06C15.96 12.4492 14.25 14.1592 14.25 16.2592V18.1392C14.25 20.2392 15.96 21.9492 18.06 21.9492H18.19C20.29 21.9492 22 20.2392 22 18.1392V16.2592C22 14.1592 20.29 12.4492 18.19 12.4492Z" fill="#a855f7"/>
              </svg>
              Explore Stations
            </span>
          </Link>
        </div>

      </div>
    </main>
  );
}
