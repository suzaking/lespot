import { readFile } from 'node:fs/promises';
import { parseDataset, isFresh } from '../src/lib/validation';
const today = new Date().toISOString().slice(0, 10);
const data = parseDataset(
  JSON.parse(await readFile('public/spots.json', 'utf8')),
  today,
);
if (data.spots.length === 0)
  throw new Error('公開用の確認済みスポットがありません');
if (data.spots.some((s) => !isFresh(s, today)))
  throw new Error(
    '確認期限切れのデータがあります。再確認か非公開化をしてください',
  );
console.log(
  'データの公開準備検査に合格。デプロイには別途アカウント・公開承認の確認が必要です。',
);
