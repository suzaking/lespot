import { readFile } from 'node:fs/promises';
import prettier from 'prettier';
const files = ["design.md","src/app/App.tsx","src/app/App.module.css","src/components/search/SearchControls.tsx","src/components/search/SearchControls.module.css","src/components/spots/SpotCard.tsx","src/components/spots/SpotCard.module.css","src/components/spots/SpotActions.tsx","src/components/map/MapView.module.css","src/styles/global.css","src/styles/tokens.css","tests/e2e/published.spec.ts","tests/e2e/search.spec.ts","tests/app.test.tsx"];
for (const path of files) {
  const source = await readFile(path, 'utf8');
  const formatted = await prettier.format(source, {
    ...(await prettier.resolveConfig(path)),
    filepath: path,
  });
  const encoded = Buffer.from(formatted).toString('base64');
  const size = 700;
  console.log('FORMAT_BEGIN|' + path + '|' + Math.ceil(encoded.length / size));
  for (let i = 0; i < encoded.length; i += size)
    console.log('FORMAT_DATA|' + path + '|' + (i / size) + '|' + encoded.slice(i, i + size));
}
console.log('FORMAT_FINISHED');
