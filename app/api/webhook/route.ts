import { NextRequest, NextResponse } from 'next/server';
import { saveNotificationToken, removeNotificationToken } from '@/lib/notifications';

// Tipos de eventos de webhook de Farcaster Mini Apps
type WebhookEventType =
    | 'miniapp_added'
    | 'miniapp_removed'
    | 'notifications_enabled'
    | 'notifications_disabled';

interface WebhookEvent {
    event: WebhookEventType;
    fid: number;
    notificationDetails?: {
        token: string;
        url: string;
    };
}

// POST - Recibir eventos de webhook de Farcaster
export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as WebhookEvent;
        const { event, fid, notificationDetails } = body;

        console.log(`Webhook received: ${event} for FID ${fid}`);

        switch (event) {
            case 'miniapp_added':
            case 'notifications_enabled':
                // Guardar token de notificacion
                if (notificationDetails?.token && notificationDetails?.url) {
                    await saveNotificationToken(
                        fid,
                        notificationDetails.token,
                        notificationDetails.url
                    );
                    console.log(`Notification token saved for FID ${fid}`);
                }
                break;

            case 'miniapp_removed':
            case 'notifications_disabled':
                // Eliminar token de notificacion
                await removeNotificationToken(fid);
                console.log(`Notification token removed for FID ${fid}`);
                break;

            default:
                console.log(`Unknown event type: ${event}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Failed to process webhook' },
            { status: 500 }
        );
    }
}

// GET - Health check
export async function GET() {
    return NextResponse.json({ status: 'ok' });
}
