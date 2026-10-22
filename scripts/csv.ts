import { parse } from 'csv-parse/sync';
import { parseDataset, type Dataset } from '../src/lib/validation';
export const columns = [
  'id',
  'name',
  'category',
  'lat',
  'lon',
  'address',
  'cost',
  'conditions',
  'facilities',
  'sourceUrl',
  'sourceLabel',
  'rights',
  'verifiedAt',
  'validUntil',
  'published',
  'fixture',
];
export function exportCsv(data: Dataset): string {
  const quote = (value: unknown) => {
    const text = String(value);
    if (/^[\s]*[=+@-]/u.test(text))
      throw new Error('表計算で数式として解釈される値はCSVへ出力できません');
    return `"${text.replaceAll('"', '""')}"`;
  };
  return (
    [
      columns.join(','),
      ...parseDataset(data).spots.map((spot) => {
        const row: Record<string, unknown> = {
          ...spot,
          facilities: spot.facilities.join('|'),
        };
        return columns.map((column) => quote(row[column])).join(',');
      }),
    ].join('\r\n') + '\r\n'
  );
}
export function importCsv(content: string, today?: string): Dataset {
  const records = parse(content, {
    bom: true,
    skip_empty_lines: true,
    columns: (headers: string[]) => {
      if (
        headers.length !== columns.length ||
        new Set(headers).size !== headers.length ||
        columns.some((c) => !headers.includes(c))
      )
        throw new Error(
          'CSV列が一致しません。data/template.csvを使用してください',
        );
      return headers;
    },
  }) as Record<string, string>[];
  const ids = new Set<string>();
  for (const row of records) {
    if (!['true', 'false'].includes(row.published ?? ''))
      throw new Error('publishedはtrueまたはfalseで指定してください');
    if (!row.id || ids.has(row.id))
      throw new Error('IDが空欄または重複しています');
    ids.add(row.id);
  }
  const spots = records
    .filter((r) => r.published === 'true')
    .map((r) => ({
      ...r,
      lat: r.lat?.trim() ? Number(r.lat) : NaN,
      lon: r.lon?.trim() ? Number(r.lon) : NaN,
      facilities: r.facilities?.trim()
        ? r.facilities.split('|').map((x) => x.trim())
        : [],
      published: r.published === 'true',
      fixture: r.fixture === 'false' ? false : true,
    }));
  return parseDataset({ schemaVersion: 1, spots }, today);
}
