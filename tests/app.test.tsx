import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi } from 'vitest';
import App from '../src/app/App';
import { loadSpots } from '../src/data/spotRepository';
import { spots } from './fixtures';
vi.mock('../src/data/spotRepository', () => ({ loadSpots: vi.fn() }));
it('searches and filters; renders safe external actions', async () => {
  vi.mocked(loadSpots).mockResolvedValue({ schemaVersion: 1, spots });
  render(<App />);
  await screen.findByRole('article', { name: spots[0]!.name });
  await userEvent.selectOptions(screen.getByLabelText('料金'), 'paid');
  expect(screen.getAllByRole('article')).toHaveLength(1);
  expect(screen.getByRole('link', { name: /徒歩ルート/ })).toHaveAttribute(
    'href',
    expect.stringContaining('travelmode=walking'),
  );
  await userEvent.click(
    screen.getByRole('button', { name: '絞り込みをリセット' }),
  );
  expect(screen.getAllByRole('article')).toHaveLength(3);
  await userEvent.type(screen.getByLabelText('スポット名・場所'), '存在しない');
  expect(
    screen.getByText('条件に合うスポットが見つかりません'),
  ).toBeInTheDocument();
});
it('keeps manual area usable after location denial', async () => {
  const getCurrentPosition = vi.fn((_success, error) => error({ code: 1 }));
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
  vi.mocked(loadSpots).mockResolvedValue({ schemaVersion: 1, spots });
  render(<App />);
  await screen.findAllByRole('article');
  expect(getCurrentPosition).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: /現在地から探す/ }));
  expect(screen.getByText(/位置情報が許可されていません/)).toBeInTheDocument();
  await userEvent.selectOptions(screen.getByLabelText('検索する地域'), 'yaba');
  expect(screen.getByText(/矢場町から近い順/)).toBeInTheDocument();
});
it('recovers from fetch error and distinguishes empty data', async () => {
  vi.mocked(loadSpots)
    .mockRejectedValueOnce(new Error())
    .mockResolvedValue({ schemaVersion: 1, spots: [] });
  render(<App />);
  await screen.findByRole('alert');
  await userEvent.click(screen.getByRole('button', { name: '再試行' }));
  await waitFor(() =>
    expect(screen.getByText('掲載スポットを確認中です')).toBeInTheDocument(),
  );
});

it('offers working quick filters without fabricating cost information', async () => {
  vi.mocked(loadSpots).mockResolvedValue({ schemaVersion: 1, spots });
  render(<App />);
  await screen.findAllByRole('article');
  const freeChip = screen.getByRole('button', { name: '無料' });
  await userEvent.click(freeChip);
  expect(freeChip).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getAllByRole('article')).toHaveLength(1);
  await userEvent.click(freeChip);
  expect(freeChip).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getAllByRole('article')).toHaveLength(3);
});
