import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const tasksPath = new URL('../TASKS.md', import.meta.url);
const nextWorkPath = new URL('../NEXT_WORK.md', import.meta.url);
const outputPath = new URL('../TASKLIST.md', import.meta.url);

const tasks = readFileSync(tasksPath, 'utf8');
const nextWork = readFileSync(nextWorkPath, 'utf8');

const taskRows = tasks
  .split(/\r?\n/)
  .map((line) => line.match(/^\|\s*(I-\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$/))
  .filter(Boolean)
  .map(([, id, name, rawStatus]) => {
    const status = rawStatus.trim();
    const normalized = status.toUpperCase();
    let label = '🔄 確認要';
    if (normalized.includes('DONE')) label = '✅ 完了';
    else if (normalized.includes('STAGED')) label = '🟡 登録待ち';
    else if (normalized.includes('NOT_RUN')) label = '⏳ 未実施';
    else if (normalized.includes('BLOCKED')) label = '⛔ 保留';
    return { id, name: name.trim(), status, label };
  });

if (taskRows.length === 0) {
  throw new Error('TASKS.mdからタスク表を読み取れませんでした。');
}

const doneCount = taskRows.filter((task) => task.label === '✅ 完了').length;
const percent = Math.round((doneCount / taskRows.length) * 100);
const updated = tasks.match(/^更新：?\s*(\d{4}-\d{2}-\d{2})/m)?.[1] ?? '記載なし';

const handoff = nextWork.match(
  /^## Current handoff[^\r\n]*\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/m,
)?.[1];
if (!handoff) {
  throw new Error('NEXT_WORK.mdからCurrent handoffを読み取れませんでした。');
}

const nextAction = handoff.match(/^Next work is ([^.]+)\./m)?.[1];
if (!nextAction) {
  throw new Error('NEXT_WORK.mdのCurrent handoffから次の作業を読み取れませんでした。');
}

const browserPass = handoff.match(
  /(\d+) Playwright tests on desktop, (\d+px) mobile, and (\d+px) narrow viewports/,
);
const latestUiTask = taskRows.find((task) => task.id === 'I-13');
const stagedBenchTask = taskRows.find((task) => task.id === 'I-12' && task.label === '🟡 登録待ち');

const nextActionJa = nextAction
  .replace(/^manual device QA:\s*/i, '')
  .replace('iOS Safari and Android Chrome', 'iOS Safari／Android Chrome')
  .replace('allowed/denied real GPS', '実GPSの許可／拒否')
  .replace('real OpenFreeMap roads-only rendering and attribution', 'OpenFreeMap道路のみの実表示と出典')
  .replace('touch/keyboard/screen-reader behavior', 'タッチ／キーボード／読み上げ操作')
  .replaceAll(', ', '、');

const currentStatus = browserPass
  ? `最新UIのブラウザ確認は${browserPass[1]}件成功（PC、幅${browserPass[2]}、幅${browserPass[3]}）。`
  : `最新UIの確認状況：${latestUiTask?.status ?? 'TASKS.mdを参照'}。`;
const liveCheckNote = /deliberately stubbed\/blocked/i.test(handoff)
  ? 'タイルとスポットAPIはテスト内で置き換えているため、実タイル・本番APIの動作確認は含みません。'
  : '';

const table = [
  '| ID | 作業 | 状態 | 詳細 |',
  '| --- | --- | --- | --- |',
  ...taskRows.map((task) => {
    const detail = task.status.replace(/^(DONE|STAGED|NOT_RUN|BLOCKED)\s*[:：]?\s*/i, '');
    return `| ${task.id} | ${task.name} | ${task.label} | ${detail || '—'} |`;
  }),
].join('\n');

const output = `# LeSpot 全体タスクリスト

> このページは自動生成です。正本は [TASKS.md](TASKS.md) と [NEXT_WORK.md](NEXT_WORK.md)。最終更新日：${updated}

## 全体の進捗

**${doneCount}/${taskRows.length}件完了（${percent}%）** — タスク件数で数えた目安です。作業量の比率ではありません。

${table}

## 現在の状態

${currentStatus}${liveCheckNote ? ` ${liveCheckNote}` : ''}

## 次にやること

1. **次の作業：** ${nextActionJa}。
${stagedBenchTask && /staged bench records/i.test(handoff) ? '2. **I-12 — ベンチ情報を本番へ登録：** 管理者によるRedisバックアップと安全な管理キー入力後に反映し、公開APIで確認します。それまでは本番Redisを変更しません。\n' : ''}

## 詳細

- [作業タスク正本](TASKS.md)
- [次の作業・引き継ぎ](NEXT_WORK.md)
- [最新の作業記録](AI_WORK_STATE.md)
- [検証記録](docs/VERIFICATION.md)
`;

const formattedOutput = (await prettier.format(output, { filepath: fileURLToPath(outputPath) })).replace(
  /\r\n/g,
  '\n',
);
writeFileSync(outputPath, formattedOutput, 'utf8');
console.log(`TASKLIST.mdを更新しました（${doneCount}/${taskRows.length}件完了）。`);


