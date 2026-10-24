import { readFile, writeFile, unlink } from 'node:fs/promises';
import prettier from 'prettier';

const paths = ["src/lib/mapViewport.ts","src/components/map/MapView.tsx","src/components/ui/SheetGrip.tsx","src/app/App.tsx","src/components/search/SearchControls.tsx","src/components/search/SearchControls.module.css","src/app/App.module.css","src/styles/global.css","tests/mapViewport.test.ts","tests/SheetGrip.test.tsx","tests/app.test.tsx","design.md"];
for (const path of paths) {
  const raw = await readFile(path, 'utf8');
  const formatted = await prettier.format(raw, {
    ...(await prettier.resolveConfig(path)),
    filepath: path,
  });
  if (raw === formatted) continue;
  await writeFile(path, formatted);
  const encoded = Buffer.from(formatted).toString('base64');
  const limit = 720;
  console.log('FMT_BEGIN|' + path + '|' + Math.ceil(encoded.length / limit));
  for (let i = 0; i < encoded.length; i += limit) {
    console.log('FMT_CHUNK|' + path + '|' + (i / limit) + '|' + encoded.slice(i, i + limit));
  }
}
console.log('FMT_COMPLETE');
await unlink(new URL(import.meta.url));
