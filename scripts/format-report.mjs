import { readFile } from 'node:fs/promises';
import prettier from 'prettier';
const paths = ["src/app/App.tsx","src/app/App.module.css","src/components/search/SearchControls.tsx","src/components/search/SearchControls.module.css","src/components/map/MapView.tsx","tests/app.test.tsx","tests/e2e/published.spec.ts","tests/e2e/search.spec.ts","design.md","docs/UI_UX.md","NEXT_WORK.md"];
for (const p of paths) {
 const input = await readFile(p, 'utf8');
 const output = await prettier.format(input, {...(await prettier.resolveConfig(p)), filepath: p});
 if (input === output) continue;
 const encoded = Buffer.from(output).toString('base64'), size = 730;
 console.log('FMT_BEGIN|' + p + '|' + Math.ceil(encoded.length/size));
 for(let i=0;i<encoded.length;i+=size) console.log('FMT_DATA|' + p + '|' + (i/size) + '|' + encoded.slice(i,i+size));
}
console.log('FMT_COMPLETE');
