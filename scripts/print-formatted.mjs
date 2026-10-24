import { readFile } from 'node:fs/promises';
import prettier from 'prettier';

const files = [
  'src/app/App.module.css',
  'src/app/App.tsx',
  'src/components/search/SearchControls.tsx',
  'src/components/spots/SpotCard.module.css',
  'src/components/spots/SpotCard.tsx',
  'src/styles/global.css',
  'TASKS.md',
];
for (const path of files) {
  const text = await readFile(path, 'utf8');
  const settings = await prettier.resolveConfig(path);
  const formatted = await prettier.format(text, {
    ...settings,
    filepath: path,
  });
  const encoded = Buffer.from(formatted).toString('base64');
  const size = 700;
  console.log(`LESPOT_FORMAT_BEGIN|${path}|${Math.ceil(encoded.length / size)}`);
  for (let i = 0; i < encoded.length; i += size) {
    console.log(`LESPOT_FORMAT|${path}|${i / size}|${encoded.slice(i, i + size)}`);
  }
}
console.log('LESPOT_FORMAT_COMPLETE');
