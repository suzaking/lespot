import { readFile, writeFile } from 'node:fs/promises';
import { exportCsv } from './csv';
import { parseDataset } from '../src/lib/validation';

const output = process.argv[2];
if (!output)
  throw new Error('使い方: npm run data:export -- imports/current.csv');
const data = parseDataset(
  JSON.parse(await readFile('public/spots.json', 'utf8')),
);
await writeFile(output, '\uFEFF' + exportCsv(data), { flag: 'wx' });
console.log(
  `公開データ${data.spots.length}件をCSVへ出力しました。既存ファイルは上書きしません。`,
);
