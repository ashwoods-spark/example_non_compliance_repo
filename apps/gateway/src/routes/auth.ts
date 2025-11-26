import { FastifyRequest, FastifyReply } from 'fastify';
import { LoginSchema } from '@repo/shared-types';

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const result = LoginSchema.safeParse(request.body);
  
  if (!result.success) {
    return reply.code(400).send({ error: 'Invalid credentials' });
  }
  
  const { email, password } = result.data;
  
  // Mock authentication
  if (email === 'demo@example.com' && password === 'password123') {
    const token = await reply.jwtSign({ email }, { expiresIn: '24h' });
    
    return {
      token,
      displayName: 'Demo User',
    };
  }
  
  return reply.code(401).send({ error: 'Invalid credentials' });
}

