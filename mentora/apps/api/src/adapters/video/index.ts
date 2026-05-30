/**
 * Video Adapter
 * -------------
 * Manages real-time video rooms for live classes and 1:1 coaching.
 * Implementations:
 *   - "mock"     (default) — generates a fake JWT-style token; the web app's built-in
 *                            mock room handles the rest. Zero dependencies, zero latency.
 *   - "livekit"  (production) — mints real access tokens for a LiveKit SFU.
 *
 * WHY LIVEKIT?
 * LiveKit is an open-source WebRTC SFU (Selective Forwarding Unit). Unlike peer-to-peer
 * WebRTC, an SFU routes media server-side, which means:
 *   1. Sub-200 ms end-to-end latency for interactive tutoring.
 *   2. Scalable from 2-person 1:1 coaching to 500-seat virtual classrooms.
 *   3. Server-side recording, transcription, and egress pipelines.
 *   4. Token-based auth (no client-side secrets) fits our JWT flow naturally.
 *
 * The factory reads VIDEO_DRIVER from env. If livekit is selected but credentials
 * are missing, it falls back to mock with a warning.
 */

import crypto from 'crypto';
import type { VideoJoinTicket } from '@mentora/shared';
import { env } from '../../config/env';

export interface VideoAdapter {
  /**
   * Create (or ensure) a named room.
   * LiveKit creates rooms lazily, but we call this to pre-configure capacity.
   * @returns the roomName (same as input, confirmed).
   */
  createRoom(name: string): Promise<string>;

  /**
   * Mint a join ticket for a participant.
   * @param roomName  Stable room identifier (stored in ClassSession.roomName).
   * @param identity  Unique user identity string (userId or displayName).
   * @param canPublish  True for teachers (they broadcast); false for students.
   */
  joinTicket(opts: {
    roomName: string;
    identity: string;
    canPublish: boolean;
  }): Promise<VideoJoinTicket>;
}

// ─── Mock adapter ─────────────────────────────────────────────────────────────

class MockVideoAdapter implements VideoAdapter {
  async createRoom(name: string): Promise<string> {
    // Nothing to create; the web client's mock room handles everything
    return name;
  }

  async joinTicket(opts: {
    roomName: string;
    identity: string;
    canPublish: boolean;
  }): Promise<VideoJoinTicket> {
    // Build a signed-looking fake token: base64url(header).base64url(payload).fakeSig
    const header = Buffer.from(JSON.stringify({ alg: 'MOCK', typ: 'JWT' })).toString('base64url');
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 h
    const payload = Buffer.from(
      JSON.stringify({
        iss: 'mentora-mock',
        sub: opts.identity,
        room: opts.roomName,
        canPublish: opts.canPublish,
        exp: Math.floor(expiresAt.getTime() / 1000),
      }),
    ).toString('base64url');
    const sig = crypto
      .createHash('sha256')
      .update(`${header}.${payload}.mock-secret`)
      .digest('hex')
      .slice(0, 32);
    const token = `${header}.${payload}.${sig}`;

    // The mock room URL — the web app should handle /mock-room/:roomName
    const url = `${env.WEB_URL}/mock-room/${encodeURIComponent(opts.roomName)}`;

    return {
      provider: 'mock',
      url,
      token,
      roomName: opts.roomName,
      identity: opts.identity,
      canPublish: opts.canPublish,
      expiresAt: expiresAt.toISOString(),
    };
  }
}

// ─── LiveKit adapter (production) ─────────────────────────────────────────────

class LiveKitVideoAdapter implements VideoAdapter {
  async createRoom(name: string): Promise<string> {
    try {
      const { RoomServiceClient } = await import('livekit-server-sdk');
      const svc = new RoomServiceClient(
        env.LIVEKIT_URL,
        env.LIVEKIT_API_KEY,
        env.LIVEKIT_API_SECRET,
      );
      await svc.createRoom({ name, emptyTimeout: 600, maxParticipants: 500 });
    } catch (err) {
      // Room may already exist — that's fine
      console.warn('[video:livekit] createRoom warning (may already exist):', err);
    }
    return name;
  }

  async joinTicket(opts: {
    roomName: string;
    identity: string;
    canPublish: boolean;
  }): Promise<VideoJoinTicket> {
    const { AccessToken, VideoGrant } = await import('livekit-server-sdk');

    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 h

    const grant = new VideoGrant({
      room: opts.roomName,
      roomJoin: true,
      canPublish: opts.canPublish,
      canSubscribe: true,
    });

    const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
      identity: opts.identity,
      ttl: 4 * 60 * 60, // 4 hours
    });
    at.addGrant(grant);

    const token = await at.toJwt();

    return {
      provider: 'livekit',
      url: env.LIVEKIT_URL,
      token,
      roomName: opts.roomName,
      identity: opts.identity,
      canPublish: opts.canPublish,
      expiresAt: expiresAt.toISOString(),
    };
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _instance: VideoAdapter | undefined;

export function getVideoAdapter(): VideoAdapter {
  if (_instance) return _instance;

  const driver = env.VIDEO_DRIVER;

  if (driver === 'livekit') {
    if (!env.LIVEKIT_URL || !env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
      console.warn(
        '[video] VIDEO_DRIVER=livekit but LIVEKIT credentials are missing — falling back to mock.',
      );
      _instance = new MockVideoAdapter();
    } else {
      _instance = new LiveKitVideoAdapter();
      console.log('[video] Using driver: LiveKitVideoAdapter');
    }
  } else {
    _instance = new MockVideoAdapter();
    console.log('[video] Using driver: MockVideoAdapter');
  }

  return _instance;
}
