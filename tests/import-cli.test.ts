// @vitest-environment node
import { it, expect } from 'vitest';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
it('leaves the previous good JSON untouched on invalid CSV', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'lespot-'));
  try {
    const input = join(dir, 'bad.csv'),
      output = join(dir, 'spots.json');
    await writeFile(input, 'id,published\nbad,true');
    await writeFile(output, 'last-good');
    const run = spawnSync(
      process.execPath,
      ['--import', 'tsx', 'scripts/import-csv.ts', input, output],
      { encoding: 'utf8' },
    );
    expect(run.status).not.toBe(0);
    expect(await readFile(output, 'utf8')).toBe('last-good');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
