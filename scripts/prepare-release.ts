import { readFile } from 'node:fs/promises';
import { parseDataset } from '../src/lib/validation';

const bootstrap: unknown = JSON.parse(
  await readFile('data/bootstrap-spots.json', 'utf8'),
);
const data = parseDataset(bootstrap);
if (data.spots.length === 0)
  throw new Error('初期DB移行用の実データがありません');
console.log(
  `DB初期移行用の確認済みレコード：${data.spots.length}件（既存DBへの上書きなし）`,
);
