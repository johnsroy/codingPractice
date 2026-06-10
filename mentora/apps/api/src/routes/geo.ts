/**
 * Geo route — GET /geo (no auth required)
 *
 * Reads the client's IP address (honouring x-forwarded-for first value,
 * then req.ip, then req.socket.remoteAddress), looks it up via geoip-lite,
 * resolves the best display currency for the detected country, and returns
 * a GeoInfo payload.
 *
 * Never throws — any failure falls back to { country: null, currency: 'USD', tier: 'T1' }.
 */

import { Router } from 'express';
import * as geoip from 'geoip-lite';
import {
  currencyForCountry,
  currencyMeta,
  type GeoInfo,
} from '@mentora/shared';

export const geoRouter = Router();

geoRouter.get('/geo', (req, res) => {
  try {
    // Honour x-forwarded-for (first IP in the chain) when behind a proxy/load-balancer.
    const forwardedFor = req.headers['x-forwarded-for'];
    let ip: string | null = null;

    if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
      ip = forwardedFor.split(',')[0].trim();
    } else if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
      ip = forwardedFor[0].trim();
    }

    if (!ip) {
      ip = req.ip ?? req.socket?.remoteAddress ?? null;
    }

    // Strip IPv6-mapped IPv4 prefix (::ffff:1.2.3.4 → 1.2.3.4)
    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.slice(7);
    }

    let country: string | null = null;

    if (ip && ip !== '127.0.0.1' && ip !== '::1' && ip !== 'localhost') {
      const lookup = geoip.lookup(ip);
      if (lookup?.country) {
        country = lookup.country;
      }
    }

    const currency = currencyForCountry(country);
    const meta = currencyMeta(currency);

    const body: GeoInfo = {
      country,
      currency,
      tier: meta.tier,
    };

    res.json(body);
  } catch {
    // Never let a geo failure break the response
    const fallback: GeoInfo = { country: null, currency: 'USD', tier: 'T1' };
    res.json(fallback);
  }
});
