import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { SheetGrip } from '../src/components/ui/SheetGrip';

it('expands by keyboard and responds to vertical pointer swipes', () => {
  const onUp = vi.fn();
  const onDown = vi.fn();
  render(<SheetGrip onUp={onUp} onDown={onDown} />);
  const grip = screen.getByRole('button', { name: 'シートを拡大または縮小' });
  fireEvent.click(grip);
  expect(onUp).toHaveBeenCalledTimes(1);
  fireEvent.pointerDown(grip, { clientY: 220, pointerId: 1 });
  fireEvent.pointerUp(grip, { clientY: 135, pointerId: 1 });
  expect(onUp).toHaveBeenCalledTimes(2);
  fireEvent.pointerDown(grip, { clientY: 110, pointerId: 2 });
  fireEvent.pointerUp(grip, { clientY: 200, pointerId: 2 });
  expect(onDown).toHaveBeenCalledTimes(1);
});
