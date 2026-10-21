import { parseDataset, type Dataset } from '../lib/validation';
export async function loadSpots(signal: AbortSignal): Promise<Dataset> {
  const response = await fetch(`${import.meta.env.BASE_URL}spots.json`, {
    signal,
    cache: 'no-cache',
  });
  if (!response.ok) throw new Error('データを取得できませんでした');
  return parseDataset(await response.json());
}
