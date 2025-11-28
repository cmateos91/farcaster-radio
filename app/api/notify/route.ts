import { NextRequest, NextResponse } from 'next/server';
import { notifyBroadcastStart } from '@/lib/notifications';

// POST - Enviar notificaciones cuando un broadcaster empieza
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { broadcasterUsername, stationTitle, roomName } = body;

        if (!broadcasterUsername || !stationTitle || !roomName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await notifyBroadcastStart(
            broadcasterUsername,
            stationTitle,
            roomName
        );

        console.log(`Notifications sent: ${result.sent}, failed: ${result.failed}`);

        return NextResponse.json({
            success: true,
            sent: result.sent,
            failed: result.failed,
        });
    } catch (error) {
        console.error('Error sending notifications:', error);
        return NextResponse.json(
            { error: 'Failed to send notifications' },
            { status: 500 }
        );
    }
}
