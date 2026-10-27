import { render, screen, fireEvent } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import MapView from '../src/components/map/MapView';
import { spot } from './fixtures';

it('names markers and supports click/space and selected state', () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  const onSelect = vi.fn();
  const results = [{ spot, distance: 0 }];
  const { rerender } = render(
    <MapView
      results={results}
      origin={spot}
      selected={null}
      onSelect={onSelect}
    />,
  );
  const marker = screen.getByRole('button', { name: `1 ${spot.name}を選択` });
  fireEvent.click(marker);
  expect(onSelect).toHaveBeenCalledWith(spot.id);
  fireEvent.keyDown(marker, { key: ' ' });
  expect(onSelect).toHaveBeenCalledTimes(2);
  rerender(
    <MapView
      results={results}
      origin={spot}
      selected={spot.id}
      onSelect={onSelect}
    />,
  );
  expect(marker).toHaveAttribute('aria-pressed', 'true');
});

it('switches between the standard and pale GSI maps', () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  render(
    <MapView results={[]} origin={spot} selected={null} onSelect={vi.fn()} />,
  );
  fireEvent.click(screen.getByRole('button', { name: '淡色地図に切り替え' }));
  expect(
    screen.getByRole('button', { name: '標準地図に切り替え' }),
  ).toBeInTheDocument();
});
