import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

function getRoomService(): RoomServiceClient {
    if (!apiKey || !apiSecret || !livekitUrl) {
        throw new Error('LIVEKIT_API_KEY, LIVEKIT_API_SECRET and NEXT_PUBLIC_LIVEKIT_URL must be set');
    }
    // Convertir wss:// a https:// para la API
    const httpUrl = livekitUrl.replace('wss://', 'https://');
    return new RoomServiceClient(httpUrl, apiKey, apiSecret);
}

export async function createToken(roomName: string, participantName: string, isPublisher: boolean) {
    if (!apiKey || !apiSecret) {
        throw new Error('LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set');
    }

    const at = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
        ttl: '1h',
    });

    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: isPublisher,
        canSubscribe: true,
    });

    return await at.toJwt();
}

export async function createRoom(roomName: string, metadata?: string) {
    const roomService = getRoomService();

    try {
        await roomService.createRoom({
            name: roomName,
            metadata: metadata,
            emptyTimeout: 60 * 5, // 5 minutos sin participantes
            maxParticipants: 100,
        });
    } catch (error) {
        // La sala puede ya existir, lo cual esta bien
        console.log('Room creation response:', error);
    }
}

export async function listRooms() {
    const roomService = getRoomService();
    const rooms = await roomService.listRooms();
    return rooms;
}

export async function getRoomInfo(roomName: string) {
    const rooms = await listRooms();
    return rooms.find(room => room.name === roomName);
}

export async function deleteRoom(roomName: string) {
    const roomService = getRoomService();
    await roomService.deleteRoom(roomName);
}
