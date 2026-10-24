import { parseDataset, type Dataset } from '../lib/validation';

export async function loadSpots(signal: AbortSignal): Promise<Dataset> {
  const response = await fetch('/api/spots', {
    signal,
    cache: 'no-cache',
  });
  if (!response.ok) throw new Error('データを取得できませんでした');
  return parseDataset(await response.json());
}
