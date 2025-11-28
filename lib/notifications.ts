import { kv } from '@vercel/kv';

// Tipos para notificaciones de Farcaster
export interface NotificationToken {
    token: string;
    url: string;
    fid: number;
    addedAt: number;
}

// Key para almacenar tokens: notif:{fid}
function getTokenKey(fid: number): string {
    return `notif:${fid}`;
}

// Guardar token de notificacion
export async function saveNotificationToken(
    fid: number,
    token: string,
    url: string
): Promise<void> {
    const data: NotificationToken = {
        token,
        url,
        fid,
        addedAt: Date.now(),
    };

    await kv.set(getTokenKey(fid), JSON.stringify(data));

    // Tambien agregar a un set de todos los FIDs con notificaciones
    await kv.sadd('notif:all', fid.toString());
}

// Eliminar token de notificacion
export async function removeNotificationToken(fid: number): Promise<void> {
    await kv.del(getTokenKey(fid));
    await kv.srem('notif:all', fid.toString());
}

// Obtener token de un usuario
export async function getNotificationToken(fid: number): Promise<NotificationToken | null> {
    const data = await kv.get<string>(getTokenKey(fid));
    if (!data) return null;

    try {
        return typeof data === 'string' ? JSON.parse(data) : data as NotificationToken;
    } catch {
        return null;
    }
}

// Obtener todos los tokens
export async function getAllNotificationTokens(): Promise<NotificationToken[]> {
    const fids = await kv.smembers('notif:all');
    if (!fids || fids.length === 0) return [];

    const tokens: NotificationToken[] = [];

    for (const fid of fids) {
        const token = await getNotificationToken(Number(fid));
        if (token) {
            tokens.push(token);
        }
    }

    return tokens;
}

// Enviar notificacion a un usuario
export async function sendNotification(
    token: NotificationToken,
    title: string,
    body: string,
    targetUrl: string,
    notificationId: string
): Promise<boolean> {
    try {
        const response = await fetch(token.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tokens: [token.token],
                notificationId,
                title: title.slice(0, 100), // Max 100 chars
                body: body.slice(0, 500), // Max 500 chars
                targetUrl,
            }),
        });

        if (!response.ok) {
            console.error(`Failed to send notification to FID ${token.fid}:`, await response.text());
            return false;
        }

        return true;
    } catch (error) {
        console.error(`Error sending notification to FID ${token.fid}:`, error);
        return false;
    }
}

// Notificar a todos los usuarios cuando un broadcaster empieza
export async function notifyBroadcastStart(
    broadcasterUsername: string,
    stationTitle: string,
    roomName: string
): Promise<{ sent: number; failed: number }> {
    const tokens = await getAllNotificationTokens();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    let sent = 0;
    let failed = 0;

    const notificationId = `broadcast-${roomName}-${Date.now()}`;

    for (const token of tokens) {
        const success = await sendNotification(
            token,
            `${broadcasterUsername} is live!`,
            `Tune in to "${stationTitle}" on TuneIn`,
            `${appUrl}/?join=${encodeURIComponent(roomName)}`,
            notificationId
        );

        if (success) {
            sent++;
        } else {
            failed++;
        }

        // Rate limit: esperar 100ms entre notificaciones
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed };
}
