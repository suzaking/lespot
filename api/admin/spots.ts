import { timingSafeEqual } from 'node:crypto';
import { ZodError } from 'zod';
import { loadStored, replaceStored } from '../../server/database';

export const config = { maxDuration: 10 };

const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

function authorized(request: Request): boolean {
  const key = process.env.LESPOT_ADMIN_TOKEN;
  const submitted = request.headers.get('authorization');
  if (!key || !submitted?.startsWith('Bearer ')) return false;
  const expected = Buffer.from(key);
  const actual = Buffer.from(submitted.slice(7));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function denied() {
  return Response.json({ error: '認証が必要です' }, { status: 401, headers });
}

export async function GET(request: Request): Promise<Response> {
  if (!authorized(request)) return denied();
  try {
    return Response.json(await loadStored(), { headers });
  } catch {
    return Response.json(
      { error: 'DB読み込みに失敗しました' },
      { status: 503, headers },
    );
  }
}

export async function PUT(request: Request): Promise<Response> {
  if (!authorized(request)) return denied();
  // A Bearer secret and strict same-origin check are both required for writes.
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    return Response.json(
      { error: '不正な送信元です' },
      { status: 403, headers },
    );
  }
  if ((Number(request.headers.get('content-length')) || 0) > 300_000) {
    return Response.json(
      { error: 'データが大きすぎます' },
      { status: 413, headers },
    );
  }
  try {
    const body = await request.text();
    if (body.length > 300_000) {
      return Response.json(
        { error: 'データが大きすぎます' },
        { status: 413, headers },
      );
    }
    const payload: unknown = JSON.parse(body);
    if (!payload || typeof payload !== 'object')
      throw new SyntaxError('Invalid JSON');
    const record = payload as Record<string, unknown>;
    if (
      typeof record.revision !== 'number' ||
      !Number.isSafeInteger(record.revision)
    ) {
      throw new SyntaxError('Invalid revision');
    }
    const saved = await replaceStored(record.revision, record.data);
    if (!saved) {
      return Response.json(
        { error: '更新競合です。再読込してください' },
        { status: 409, headers },
      );
    }
    return Response.json(saved, { headers });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json(
        { error: '入力内容が不正です。必須項目や日付を確認してください' },
        { status: 400, headers },
      );
    }
    return Response.json(
      { error: '保存できませんでした' },
      { status: 503, headers },
    );
  }
}
