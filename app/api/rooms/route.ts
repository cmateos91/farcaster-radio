import { NextRequest, NextResponse } from 'next/server';
import { listRooms } from '@/lib/livekit';
import { parseRoomMetadata, parseRoomName, type RoomMetadata } from '@/lib/farcaster';

export interface RoomInfo {
    name: string;
    metadata: RoomMetadata | null;
    numParticipants: number;
    createdAt: number;
}

// GET - Listar salas activas
export async function GET(req: NextRequest) {
    try {
        const rooms = await listRooms();

        // Filtrar solo salas de radio y parsear metadata
        const radioRooms: RoomInfo[] = rooms
            .filter(room => room.name.startsWith('radio-'))
            .map(room => {
                const metadata = room.metadata
                    ? parseRoomMetadata(room.metadata)
                    : null;

                return {
                    name: room.name,
                    metadata,
                    numParticipants: room.numParticipants,
                    createdAt: metadata?.createdAt || Date.now(),
                };
            })
            // Ordenar por numero de participantes (mas populares primero)
            .sort((a, b) => b.numParticipants - a.numParticipants);

        return NextResponse.json({ rooms: radioRooms });
    } catch (error) {
        console.error('Error listing rooms:', error);
        return NextResponse.json({ error: 'Failed to list rooms' }, { status: 500 });
    }
}
