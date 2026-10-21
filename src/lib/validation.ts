import { z } from 'zod';
const text = z.string().trim().min(1).max(600);
const httpsUrl = z.url().refine((v) => {
  const u = new URL(v);
  return u.protocol === 'https:' && !u.username && !u.password;
}, '出典は認証情報を含まないHTTPS URLにしてください');
export const categorySchema = z.enum(['park', 'public', 'cafe', 'other']);
export const costSchema = z.enum(['free', 'paid', 'unknown']);
export const coordinatesSchema = z.object({
  lat: z.number().min(-85).max(85),
  lon: z.number().min(-180).max(180),
});
export const spotSchema = z
  .strictObject({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/),
    name: text,
    category: categorySchema,
    lat: z.number().min(34.8).max(35.5),
    lon: z.number().min(136.5).max(137.3),
    address: text,
    cost: costSchema,
    conditions: text,
    facilities: z.array(text).max(20),
    sourceUrl: httpsUrl,
    sourceLabel: text,
    rights: text,
    verifiedAt: z.iso.date(),
    validUntil: z.iso.date(),
    published: z.literal(true),
    fixture: z.literal(false),
  })
  .superRefine((s, ctx) => {
    if (s.validUntil < s.verifiedAt)
      ctx.addIssue({
        code: 'custom',
        message: '確認期限は確認日以降にしてください',
      });
    if (
      /^(test|fixture|sample|demo)(-|$)/i.test(s.id) ||
      /架空|テスト用/.test(s.name)
    )
      ctx.addIssue({
        code: 'custom',
        message: 'テスト用データは公開できません',
      });
  });
export const datasetSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    spots: z.array(spotSchema).max(500),
  })
  .superRefine((d, ctx) => {
    const ids = new Set<string>();
    for (const s of d.spots) {
      if (ids.has(s.id))
        ctx.addIssue({ code: 'custom', message: `ID重複: ${s.id}` });
      ids.add(s.id);
    }
  });
export type Spot = z.infer<typeof spotSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Dataset = z.infer<typeof datasetSchema>;
export function parseDataset(
  input: unknown,
  today = new Date().toISOString().slice(0, 10),
): Dataset {
  const data = datasetSchema.parse(input);
  if (data.spots.some((s) => s.verifiedAt > today))
    throw new Error('未来の確認日は公開できません');
  return data;
}
export function isFresh(spot: Spot, today: string): boolean {
  return today <= spot.validUntil;
}
