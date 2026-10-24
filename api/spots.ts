import { loadStored } from './_lib/database';

export const config = { maxDuration: 10 };

export async function GET(): Promise<Response> {
  try {
    const record = await loadStored();
    return Response.json(record.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
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
