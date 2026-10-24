import bootstrap from '../data/bootstrap-spots.json';
import {
  datasetSchema,
  parseDataset,
  type Dataset,
} from '../src/lib/validation';

const KEY = 'lespot:spots:v1';
const SCRIPT =
  "if redis.call('GET', KEYS[1]) == ARGV[1] then redis.call('SET', KEYS[1], ARGV[2]); return 1 else return 0 end";

export type Stored = { revision: number; data: Dataset };

function credentials(readOnly: boolean) {
  const url = process.env.KV_REST_API_URL;
  const token = readOnly
    ? (process.env.KV_REST_API_READ_ONLY_TOKEN ?? process.env.KV_REST_API_TOKEN)
    : process.env.KV_REST_API_TOKEN;
  if (!url || !token || !url.startsWith('https://')) {
    throw new Error('Redis接続設定がありません');
  }
  return { url, token };
}

async function command<T>(
  args: (string | number)[],
  readOnly = false,
): Promise<T> {
  const { url, token } = credentials(readOnly);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(7000),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Redisに接続できませんでした');
  const payload: unknown = await response.json();
  if (
    !payload ||
    typeof payload !== 'object' ||
    'error' in payload ||
    !('result' in payload)
  ) {
    throw new Error('Redisの応答が不正です');
  }
  return (payload as { result: T }).result;
}

function decode(value: unknown): Stored {
  if (typeof value !== 'string') throw new Error('Redisのデータ形式が不正です');
  const raw: unknown = JSON.parse(value);
  if (!raw || typeof raw !== 'object' || !('revision' in raw)) {
    throw new Error('DBデータのバージョンが不正です');
  }
  const candidate = raw as Record<string, unknown>;
  const revision = candidate.revision;
  if (
    typeof revision !== 'number' ||
    !Number.isSafeInteger(revision) ||
    revision < 1
  ) {
    throw new Error('DBリビジョンが不正です');
  }
  return { revision, data: parseDataset(candidate.data) };
}

async function seed(): Promise<void> {
  // SET NX is atomic and never overwrites a dataset changed by an administrator.
  const data = parseDataset(bootstrap);
  await command(['SET', KEY, JSON.stringify({ revision: 1, data }), 'NX']);
}

async function loadRaw(): Promise<string> {
  let raw = await command<string | null>(['GET', KEY], true);
  if (raw === null) {
    await seed();
    raw = await command<string | null>(['GET', KEY], true);
  }
  if (raw === null) throw new Error('DBの初期化に失敗しました');
  return raw;
}

export async function loadStored(): Promise<Stored> {
  return decode(await loadRaw());
}

export async function replaceStored(
  expectedRevision: number,
  input: unknown,
): Promise<Stored | null> {
  const previousRaw = await loadRaw();
  const previous = decode(previousRaw);
  if (previous.revision !== expectedRevision) return null;
  const data = datasetSchema.parse(input);
  const normalized = parseDataset(data);
  const next = { revision: previous.revision + 1, data: normalized };
  const changed = await command<number>([
    'EVAL',
    SCRIPT,
    1,
    KEY,
    previousRaw,
    JSON.stringify(next),
  ]);
  return changed === 1 ? next : null;
}
