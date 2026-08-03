const { spawnSync } = require('child_process');

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
  });

  return result.status ?? 1;
}

const databaseUrl = process.env.DATABASE_URL || '';
const isPostgresUrl = /^(postgres|postgresql):\/\//i.test(databaseUrl);
const shouldPushSchema = process.env.PRISMA_DB_PUSH_ON_BUILD === '1' && isPostgresUrl;

if (!isPostgresUrl) {
  console.log('Skipping prisma db push because DATABASE_URL is not a PostgreSQL URL.');
  process.exit(0);
}

if (!shouldPushSchema) {
  console.log('Skipping prisma db push during build. Set PRISMA_DB_PUSH_ON_BUILD=1 to push schema explicitly.');
  process.exit(0);
}

console.log('Applying Prisma schema to PostgreSQL database...');
const exitCode = run(process.platform === 'win32' ? 'prisma.cmd' : 'prisma', ['db', 'push']);

if (exitCode !== 0) {
  console.warn('Prisma db push failed, but build will continue. Fix DATABASE_URL credentials in Vercel to enable runtime database access.');
}

process.exit(0);
