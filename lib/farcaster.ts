import { sdk } from '@farcaster/miniapp-sdk';

// Tipos de usuario de Farcaster
export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  custodyAddress?: string;
}

// Generar nombre de sala basado en FID
export function generateRoomName(fid: number, slug?: string): string {
  const safeSlug = slug
    ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 20)
    : 'live';
  return `radio-${fid}-${safeSlug}`;
}

// Parsear nombre de sala para obtener FID
export function parseRoomName(roomName: string): { fid: number; slug: string } | null {
  const match = roomName.match(/^radio-(\d+)-(.+)$/);
  if (!match) return null;
  return {
    fid: parseInt(match[1], 10),
    slug: match[2],
  };
}

// Verificar si un usuario es el dueño de una sala
export function isRoomOwner(roomName: string, userFid: number): boolean {
  const parsed = parseRoomName(roomName);
  return parsed?.fid === userFid;
}

// Compartir en cast
export async function shareToCast(text: string, embeds?: string[]): Promise<void> {
  try {
    await sdk.actions.composeCast({
      text,
      embeds: embeds as [] | [string] | [string, string] | undefined,
    });
  } catch (error) {
    console.error('Error sharing to cast:', error);
    throw error;
  }
}

// Ver perfil de un usuario
export async function viewProfile(fid: number): Promise<void> {
  try {
    await sdk.actions.viewProfile({ fid });
  } catch (error) {
    console.error('Error viewing profile:', error);
  }
}

// Abrir URL externa
export async function openExternalUrl(url: string): Promise<void> {
  try {
    await sdk.actions.openUrl(url);
  } catch (error) {
    // Fallback para cuando no estamos en miniapp
    window.open(url, '_blank');
  }
}

// Metadata de sala para LiveKit
export interface RoomMetadata {
  ownerFid: number;
  ownerUsername?: string;
  ownerDisplayName?: string;
  ownerPfpUrl?: string;
  ownerWallet?: string;
  title: string;
  createdAt: number;
}

export function createRoomMetadata(user: FarcasterUser, title: string): RoomMetadata {
  return {
    ownerFid: user.fid,
    ownerUsername: user.username,
    ownerDisplayName: user.displayName,
    ownerPfpUrl: user.pfpUrl,
    ownerWallet: user.custodyAddress,
    title,
    createdAt: Date.now(),
  };
}

export function parseRoomMetadata(metadata: string): RoomMetadata | null {
  try {
    return JSON.parse(metadata) as RoomMetadata;
  } catch {
    return null;
  }
}
