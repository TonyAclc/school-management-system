import { Server } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './shared/utils/logger';
import { disconnectPrisma } from './db/prisma';

const SHUTDOWN_TIMEOUT_MS = 10000;

const start = (): Server => {
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'server started');
  });
  return server;
};

const shutdown = async (server: Server, signal: string): Promise<void> => {
  logger.info({ signal }, 'shutdown initiated');

  const closeServer = new Promise<void>((resolve, reject) => {
    server.close(err => err ? reject(err) : resolve());
  });

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('shutdown timed out')), SHUTDOWN_TIMEOUT_MS).unref()
  );

  try {
    await Promise.race([closeServer, timeout]);
    await disconnectPrisma();
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'shutdown error');
    process.exit(1);
  }
};

const main = () => {
  const server = start();

  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => void shutdown(server, signal));
  }

  process.on('uncaughtException', err => { 
    logger.fatal({ err }); 
    process.exit(1); 
  });
  
  process.on('unhandledRejection', err => { 
    logger.fatal({ err }); 
    process.exit(1); 
  });
};

main();
