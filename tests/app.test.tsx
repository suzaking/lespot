import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi } from 'vitest';
import App from '../src/app/App';
import { loadSpots } from '../src/data/spotRepository';
import { spots } from './fixtures';

vi.mock('../src/data/spotRepository', () => ({ loadSpots: vi.fn() }));

it('starts with the map, without an open information sheet', async () => {
  vi.mocked(loadSpots).mockResolvedValue({ schemaVersion: 1, spots });
  render(<App />);
  await screen.findByRole('button', { name: /スポットを見る/ });
  expect(
    screen.queryByRole('heading', { name: /休憩スポット.*件/ }),
  ).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /スポットを見る/ }));
  expect(screen.getAllByRole('article')).toHaveLength(3);
  await userEvent.click(
    screen.getByRole('button', { name: '結果一覧を閉じる' }),
  );
  expect(screen.queryByRole('article')).not.toBeInTheDocument();
});

it('supports filtering and safe walking links in contextual panels', async () => {
  vi.mocked(loadSpots).mockResolvedValue({ schemaVersion: 1, spots });
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '検索条件を開く' }));
  await userEvent.selectOptions(screen.getByLabelText('料金'), 'paid');
  expect(screen.getAllByRole('article')).toHaveLength(1);
  await userEvent.click(screen.getByRole('button', { name: spots[1]!.name }));
  expect(screen.getByRole('link', { name: /徒歩ルート/ })).toHaveAttribute(
    'href',
    expect.stringContaining('travelmode=walking'),
  );
  await userEvent.click(screen.getByRole('button', { name: '詳細を見る' }));
  expect(screen.getByText('出典・確認日')).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole('button', { name: 'スポット詳細を閉じる' }),
  );
  await userEvent.click(screen.getByRole('button', { name: /スポットを見る/ }));
  await userEvent.click(
    screen.getByRole('button', { name: '絞り込みをリセット' }),
  );
  expect(screen.getAllByRole('article')).toHaveLength(3);
});

it('keeps manual area usable after location denial', async () => {
  const getCurrentPosition = vi.fn((_success, error) => error({ code: 1 }));
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
  vi.mocked(loadSpots).mockResolvedValue({ schemaVersion: 1, spots });
  render(<App />);
  expect(getCurrentPosition).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: '現在地から探す' }));
  expect(screen.getByText(/位置情報が許可されていません/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '検索条件を開く' }));
  await userEvent.selectOptions(screen.getByLabelText('検索する地域'), 'yaba');
  expect(screen.getByText(/矢場町から近い順/)).toBeInTheDocument();
});

it('recovers from fetch error and distinguishes empty DB data', async () => {
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

it('supports quick filters without claiming expired prices as free', async () => {
  vi.mocked(loadSpots).mockResolvedValue({ schemaVersion: 1, spots });
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '検索条件を開く' }));
  const freeChip = screen.getByRole('button', { name: '無料' });
  await userEvent.click(freeChip);
  expect(freeChip).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getAllByRole('article')).toHaveLength(1);
  await userEvent.click(freeChip);
  expect(freeChip).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getAllByRole('article')).toHaveLength(3);
});

it('suggests verified DB places and opens their details from search', async () => {
  vi.mocked(loadSpots).mockResolvedValue({ schemaVersion: 1, spots });
  render(<App />);
  await screen.findByRole('button', { name: /スポットを見る/ });
  const search = screen.getByRole('combobox', { name: 'スポット名・場所' });
  await userEvent.type(search, 'カフェB');
  const option = screen.getByRole('option', { name: /架空テスト用のカフェB/ });
  await userEvent.click(option);
  expect(
    screen.getByRole('heading', { name: spots[1]!.name }),
  ).toBeInTheDocument();
});

