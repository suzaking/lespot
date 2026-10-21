import { useEffect, useState } from 'react';
import { loadSpots } from '../data/spotRepository';
import type { Spot } from '../lib/validation';
type State = { status: 'loading' | 'error' | 'ready'; spots: Spot[] };
export function useSpots(): State & { retry: () => void } {
  const [state, setState] = useState<State>({ status: 'loading', spots: [] });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      setState({ status: 'error', spots: [] });
    }, 15000);
    loadSpots(controller.signal)
      .then((d) => {
        if (!controller.signal.aborted)
          setState({ status: 'ready', spots: d.spots });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setState({ status: 'error', spots: [] });
      })
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [attempt]);
  return {
    ...state,
    retry: () => {
      setState({ status: 'loading', spots: [] });
      setAttempt((n) => n + 1);
    },
  };
}
