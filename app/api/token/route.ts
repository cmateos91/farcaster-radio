import { NextRequest, NextResponse } from 'next/server';
import { createToken, createRoom } from '@/lib/livekit';
import { parseRoomName } from '@/lib/farcaster';

// POST - Crear token con metadata (nuevo)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { room, username, role, fid, metadata } = body;

        if (!room || !username) {
            return NextResponse.json({ error: 'Missing room or username' }, { status: 400 });
        }

        const isPublisher = role === 'broadcaster';

        // Si es broadcaster, validar que el FID coincida con el room
        if (isPublisher) {
            const parsed = parseRoomName(room);
            if (parsed && fid && parsed.fid !== fid) {
                return NextResponse.json(
                    { error: 'You can only broadcast on your own station' },
                    { status: 403 }
                );
            }

            // Crear sala con metadata si es broadcaster
            if (metadata) {
                await createRoom(room, JSON.stringify(metadata));
            }
        }

        const token = await createToken(room, username, isPublisher);
        return NextResponse.json({ token });
    } catch (error) {
        console.error('Error creating token:', error);
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }
}

// GET - Mantener compatibilidad con la API anterior
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const room = searchParams.get('room');
    const username = searchParams.get('username');
    const role = searchParams.get('role');

    if (!room || !username) {
        return NextResponse.json({ error: 'Missing room or username' }, { status: 400 });
    }

    try {
        const isPublisher = role === 'broadcaster';
        const token = await createToken(room, username, isPublisher);
        return NextResponse.json({ token });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }
}
