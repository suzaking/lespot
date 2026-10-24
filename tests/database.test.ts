// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as publicGET } from '../api/spots';
import { GET as adminGET, PUT as adminPUT } from '../api/admin/spots';

const origin = 'https://lespot.example';
const adminKey = 'test-admin-key';
let stored: string | null = null;
let writes = 0;

beforeEach(() => {
  stored = null;
  writes = 0;
  vi.stubEnv('KV_REST_API_URL', 'https://redis.example');
  vi.stubEnv('KV_REST_API_TOKEN', 'test-redis-token');
  vi.stubEnv('KV_REST_API_READ_ONLY_TOKEN', 'test-redis-readonly');
  vi.stubEnv('LESPOT_ADMIN_TOKEN', adminKey);
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
    const command = JSON.parse(String(init.body)) as unknown[];
    let result: unknown;
    if (command[0] === 'GET') {
      result = stored;
    } else if (command[0] === 'SET') {
      if (stored === null) {
        stored = String(command[2]);
        writes += 1;
        result = 'OK';
      } else {
        result = null;
      }
    } else if (command[0] === 'EVAL') {
      if (stored === command[4]) {
        stored = String(command[5]);
        writes += 1;
        result = 1;
      } else {
        result = 0;
      }
    } else {
      throw new Error('unexpected Redis command');
    }
    return Response.json({ result });
  }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('Redis-backed spot service', () => {
  it('seeds the two real places once without overwriting stored data', async () => {
    const first = await publicGET();
    expect(first.status).toBe(200);
    const json = await first.json();
    expect(json.spots).toHaveLength(2);
    expect(writes).toBe(1);
    expect((await publicGET()).status).toBe(200);
    expect(writes).toBe(1);
    expect(first.headers.get('Cache-Control')).toBe('no-store');
  });

  it('blocks unauthenticated admin API access and foreign origins', async () => {
    expect((await adminGET(new Request(origin + '/api/admin/spots'))).status).toBe(401);
    const headers = { Authorization: 'Bearer ' + adminKey };
    expect((await adminGET(new Request(origin + '/api/admin/spots', { headers }))).status).toBe(200);
    expect((await adminPUT(new Request(origin + '/api/admin/spots', {
      method: 'PUT', headers: { ...headers, Origin: 'https://attacker.example' },
      body: JSON.stringify({ revision: 1, data: { schemaVersion: 1, spots: [] } }),
    }))).status).toBe(403);
  });

  it('updates atomically, rejects stale revisions and invalid records', async () => {
    const headers = {
      Authorization: 'Bearer ' + adminKey,
      Origin: origin,
      'Content-Type': 'application/json',
    };
    const initial = await (await adminGET(new Request(origin + '/api/admin/spots', { headers }))).json();
    expect(initial.revision).toBe(1);
    const next = { schemaVersion: 1, spots: initial.data.spots.slice(0, 1) };
    const put = (revision: number, data: unknown) => adminPUT(new Request(origin + '/api/admin/spots', {
      method: 'PUT', headers, body: JSON.stringify({ revision, data }),
    }));
    expect((await put(1, next)).status).toBe(200);
    expect((await put(1, next)).status).toBe(409);
    expect((await put(2, { schemaVersion: 1, spots: [{ id: 'test-item' }] })).status).toBe(400);
    const latest = await (await publicGET()).json();
    expect(latest.spots).toHaveLength(1);
    expect(writes).toBe(2);
  });
});
