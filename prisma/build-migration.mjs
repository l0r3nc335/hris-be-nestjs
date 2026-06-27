import fs from 'fs';

const sql = fs.readFileSync('prisma/migration-draft.sql', 'utf8').replace(/\r/g, '');
const lines = sql.split('\n');
const out = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (/^CREATE TABLE "[^"]+" \($/.test(line)) {
    out.push(line);
    out.push('    "id" SERIAL NOT NULL,');
    continue;
  }

  const pkey = line.match(/^\s+CONSTRAINT "([^"]+)_pkey" PRIMARY KEY \("uuid"\)$/);
  if (pkey) {
    const table = pkey[1];
    out.push(`    CONSTRAINT "${table}_pkey" PRIMARY KEY ("uuid"),`);
    out.push(`    CONSTRAINT "${table}_id_key" UNIQUE ("id")`);
    continue;
  }

  if (/^\);$/.test(line) && out[out.length - 1]?.includes('_id_key" UNIQUE')) {
    out.push(');');
    continue;
  }

  out.push(line);
}

const result = out.join('\n').trim() + '\n';

fs.mkdirSync('prisma/migrations/20250627000000_init_id_uuid', { recursive: true });
fs.writeFileSync(
  'prisma/migrations/20250627000000_init_id_uuid/migration.sql',
  result,
);
console.log('Migration written');
