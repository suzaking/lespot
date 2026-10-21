import { readFile } from 'node:fs/promises';
import { parseDataset } from '../src/lib/validation';
const data = parseDataset(
  JSON.parse(await readFile('public/spots.json', 'utf8')),
);
console.log(`公開JSON検証: ${data.spots.length}件。架空データ・非公開行なし。`);
