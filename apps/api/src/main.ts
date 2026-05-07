import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { analyzeClothingPhotos } from './services/ai.js';

dotenv.config({ path: '../../.env.local' });

const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:19006',
  credentials: true,
});

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

fastify.post<{ Body: { photos: string[] } }>('/api/analyze', async (request, reply) => {
  try {
    const { photos } = request.body;

    if (!photos || photos.length === 0) {
      return reply.status(400).send({ error: 'No photos provided' });
    }
    if (photos.length > 6) {
      return reply.status(400).send({ error: 'Maximum 6 photos allowed' });
    }

    const result = await analyzeClothingPhotos(photos);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in /api/analyze:', message);
    return reply.status(500).send({ error: message });
  }
});

// eBay Auth route placeholder
fastify.get('/api/auth/ebay', async (request, reply) => {
  // TODO: Implement eBay OAuth flow
  return { message: 'eBay auth coming soon' };
});

// Start server
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
