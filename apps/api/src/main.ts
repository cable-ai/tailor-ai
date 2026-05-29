import { createHash } from 'crypto';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { analyzeClothingPhotos, ClothingAnalysisResult } from './services/ai.js';
import {
  exchangeCodeForToken,
  getEbayAuthUrl,
  getStoredToken,
  isMockMode,
  publishListing,
} from './services/ebay.js';

dotenv.config({ path: '../../.env.local' });

console.log('[startup] CORS_ORIGIN env:', process.env.CORS_ORIGIN ?? '(not set — using reflect-origin)');
console.log('[startup] EBAY_SANDBOX_CLIENT_ID:', process.env.EBAY_SANDBOX_CLIENT_ID ?? '(not set)');
console.log('[startup] MOCK_EBAY:', process.env.MOCK_EBAY === 'true' ? 'enabled' : 'disabled');

const fastify = Fastify({ logger: true });

fastify.addHook('onRequest', async (request) => {
  console.log(`[request] ${request.method} ${request.url} Origin: ${request.headers.origin ?? '(none)'}`);
});

fastify.register(cors, {
  // In production set CORS_ORIGIN to your domain. In dev, reflect the request origin so any
  // local port (8081, 19006, etc.) works without config changes.
  origin: process.env.CORS_ORIGIN ?? true,
  credentials: true,
});

fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

fastify.post<{ Body: { photos: string[] } }>('/api/analyze', async (request, reply) => {
  try {
    const { photos } = request.body;
    if (!photos || photos.length === 0) {
      return reply.status(400).send({ error: 'No photos provided' });
    }
    if (photos.length > 6) {
      return reply.status(400).send({ error: 'Maximum 6 photos allowed' });
    }
    return await analyzeClothingPhotos(photos);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    fastify.log.error('Error in /api/analyze: %s', message);
    return reply.status(500).send({ error: message });
  }
});

// eBay OAuth — redirect to eBay authorization page
fastify.get('/api/auth/ebay', async (_request, reply) => {
  if (isMockMode()) {
    return reply.type('text/html').send(
      `<!DOCTYPE html><html><head><title>eBay Connected (Mock)</title></head><body>
      <h2>eBay connected! (mock mode)</h2>
      <p>You can close this window and return to Tailor AI.</p>
      <script>window.close();</script>
      </body></html>`,
    );
  }
  try {
    const authUrl = getEbayAuthUrl();
    return reply.redirect(authUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Configuration error';
    return reply.status(500).send({ error: message });
  }
});

// eBay OAuth callback — exchange code for token, then close the popup
fastify.get<{ Querystring: { code?: string; error?: string } }>(
  '/api/auth/ebay/callback',
  async (request, reply) => {
    const { code, error } = request.query;

    if (error || !code) {
      return reply.type('text/html').send(
        `<!DOCTYPE html><html><head><title>eBay Auth</title></head><body>
        <h2>Authorization denied</h2>
        <p>${error ?? 'No authorization code received.'}</p>
        <script>window.close();</script>
        </body></html>`,
      );
    }

    try {
      await exchangeCodeForToken(code);
      return reply.type('text/html').send(
        `<!DOCTYPE html><html><head><title>eBay Connected</title></head><body>
        <h2>eBay connected!</h2>
        <p>You can close this window and return to Tailor AI.</p>
        <script>window.close();</script>
        </body></html>`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Token exchange failed';
      fastify.log.error('eBay token exchange error: %s', message);
      return reply.type('text/html').send(
        `<!DOCTYPE html><html><head><title>eBay Auth Error</title></head><body>
        <h2>Connection failed</h2>
        <p>${message}</p>
        <script>window.close();</script>
        </body></html>`,
      );
    }
  },
);

// eBay connection status — polled by the frontend
fastify.get('/api/auth/ebay/status', async () => ({
  connected: getStoredToken() !== null,
}));

// Publish listing to eBay
fastify.post<{ Body: { result: ClothingAnalysisResult; price: number } }>(
  '/api/publish',
  async (request, reply) => {
    const token = getStoredToken();
    if (!token) {
      return reply.status(401).send({ error: 'eBay account not connected. Please authorize first.' });
    }

    const { result, price } = request.body;

    if (!result || typeof price !== 'number' || price <= 0) {
      return reply.status(400).send({ error: 'Invalid request: result and price > 0 required.' });
    }

    try {
      const listingUrl = await publishListing(token.accessToken, { result, price });
      return { listingUrl };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Publishing failed';
      fastify.log.error('Error in /api/publish: %s', message);
      return reply.status(500).send({ error: message });
    }
  },
);

// eBay marketplace account deletion notifications (compliance requirement)
// GET: challenge-response verification — eBay calls this to prove you own the endpoint
// POST: receives account deletion events — respond 200 to acknowledge
fastify.get<{ Querystring: { challenge_code?: string } }>(
  '/api/marketplace/account-deletion',
  async (request, reply) => {
    const { challenge_code: challengeCode } = request.query;
    if (!challengeCode) {
      return reply.status(400).send({ error: 'Missing challenge_code' });
    }

    const verificationToken = process.env.EBAY_VERIFICATION_TOKEN;
    const endpointUrl = process.env.EBAY_NOTIFICATION_ENDPOINT_URL;

    if (!verificationToken || !endpointUrl) {
      fastify.log.error(
        'EBAY_VERIFICATION_TOKEN or EBAY_NOTIFICATION_ENDPOINT_URL not configured',
      );
      return reply.status(500).send({ error: 'Notification endpoint not configured' });
    }

    const challengeResponse = createHash('sha256')
      .update(challengeCode + verificationToken + endpointUrl)
      .digest('hex');

    return reply.send({ challengeResponse });
  },
);

fastify.post('/api/marketplace/account-deletion', async (_request, reply) => {
  // In production: parse the notification body, delete user data per eBay's policy
  return reply.status(200).send();
});

const start = async () => {
  try {
    const port = parseInt(process.env.API_PORT || '4000', 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`✅ API server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
