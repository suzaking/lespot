import { loadStored } from '../server/database.js';

export const config = { maxDuration: 10 };

export async function GET(): Promise<Response> {
  try {
    const record = await loadStored();
    return Response.json(record.data, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return Response.json(
      { error: 'スポットを取得できませんでした' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
