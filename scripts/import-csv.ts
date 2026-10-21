import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { importCsv } from './csv';
const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const input = args[0];
if (!input)
  throw new Error(
    '使い方: npm run data:import -- imports/spots.csv [output.json]',
  );
const output = resolve(args[1] ?? 'public/spots.json');
const temp = resolve(dirname(output), `.spots-${randomUUID()}.tmp`);
try {
  const data = importCsv(await readFile(input, 'utf8'));
  if (data.spots.length === 0 && !process.argv.includes('--allow-empty'))
    throw new Error(
      '公開対象0件です。全件削除する場合のみ --allow-empty を指定してください',
    );
  await writeFile(temp, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
  await rename(temp, output);
  console.log(
    `検証済み${data.spots.length}件を生成しました。公開・デプロイは行っていません。`,
  );
} finally {
  await rm(temp, { force: true });
}
