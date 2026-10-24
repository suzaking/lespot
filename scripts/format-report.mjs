import { readFile } from 'node:fs/promises';
import prettier from 'prettier';
const paths = ["api/spots.ts","api/admin/spots.ts","server/database.ts","src/admin/Admin.tsx","src/admin/Admin.module.css","src/admin/main.tsx","admin.html","vite.config.ts","src/app/App.tsx","src/app/App.module.css","src/components/search/SearchControls.tsx","src/components/search/SearchControls.module.css","src/data/spotRepository.ts","scripts/prepare-release.ts","scripts/validate-data.ts","tests/database.test.ts","tests/published-data.test.ts","tests/e2e/published.spec.ts","tests/e2e/search.spec.ts","docs/DB_OPERATIONS.md","docs/REQUIREMENTS.md","README.md","NEXT_WORK.md","design.md"];
for (const p of paths) {
  const raw = await readFile(p, 'utf8');
  const formatted = await prettier.format(raw, {...(await prettier.resolveConfig(p)), filepath: p});
  if (raw === formatted) continue;
  const encoded = Buffer.from(formatted).toString('base64');
  const size = 730;
  console.log('FMT_BEGIN|' + p + '|' + Math.ceil(encoded.length / size));
  for(let i=0;i<encoded.length;i+=size) console.log('FMT_DATA|' + p + '|' + (i/size) + '|' + encoded.slice(i,i+size));
}
console.log('FMT_COMPLETE');
