import { readFile } from 'node:fs/promises';
import { parseDataset } from '../src/lib/validation';

const data = parseDataset(
  JSON.parse(await readFile('data/bootstrap-spots.json', 'utf8')),
);
console.log(`初期DB移行データ検証: ${data.spots.length}件。既存DBへの上書きなし。`);
