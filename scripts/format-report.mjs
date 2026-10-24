import { readFile } from 'node:fs/promises';
import prettier from 'prettier';
const p = 'tests/app.test.tsx';
const input = await readFile(p, 'utf8');
const output = await prettier.format(input, {...(await prettier.resolveConfig(p)), filepath: p});
const encoded = Buffer.from(output).toString('base64');
console.log('FMT_BEGIN|' + p + '|' + Math.ceil(encoded.length/730));
for (let i=0;i<encoded.length;i+=730) console.log('FMT_DATA|' + p + '|' + (i/730) + '|' + encoded.slice(i,i+730));
console.log('FMT_COMPLETE');
