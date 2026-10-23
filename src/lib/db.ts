/* eslint-disable @typescript-eslint/no-require-imports */
// In dev, bust Node's require cache for @prisma/client + the generated engine
// so a fresh DMMF is picked up after `prisma generate` (i.e. when the schema
// changes). In production the require cache is left alone for speed.
function loadPrismaClientCtor(): typeof import('@prisma/client').PrismaClient {
  if (process.env.NODE_ENV !== 'production' && typeof require !== 'undefined' && require.cache) {
    for (const key of Object.keys(require.cache)) {
      if (key.includes('@prisma/client') || key.includes('/.prisma/client')) {
        delete require.cache[key]
      }
    }
  }
  return require('@prisma/client').PrismaClient
}

const PrismaClient = loadPrismaClientCtor()

// Bump the cache key version whenever the Prisma schema changes (e.g. when a
// new field is added) so the dev server's cached PrismaClient singleton is
// re-created with the freshly generated DMMF.
const PRISMA_CACHE_KEY = 'prismaV7'

const globalForPrisma = globalThis as unknown as {
  prismaV7?: import('@prisma/client').PrismaClient | undefined
  prismaV6?: import('@prisma/client').PrismaClient | undefined
  prismaV5?: import('@prisma/client').PrismaClient | undefined
  prisma?: import('@prisma/client').PrismaClient | undefined
}

export const db =
  globalForPrisma[PRISMA_CACHE_KEY] ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma[PRISMA_CACHE_KEY] = db
  // Clear any stale cache from previous keys.
  globalForPrisma.prisma = undefined
  globalForPrisma.prismaV5 = undefined
  globalForPrisma.prismaV6 = undefined
}
