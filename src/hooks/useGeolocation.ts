import { useEffect, useRef, useState } from 'react';
import { coordinatesSchema, type Coordinates } from '../lib/validation';
export function useGeolocation(onLocated: (point: Coordinates) => void) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const requestId = useRef(0);
  useEffect(
    () => () => {
      requestId.current++;
    },
    [],
  );
  function cancel(): void {
    requestId.current++;
    setPending(false);
    setMessage('');
  }
  function locate(): void {
    if (!navigator.geolocation) {
      setMessage(
        'この環境は位置情報に対応していません。地域を選んでください。',
      );
      return;
    }
    const id = ++requestId.current;
    setPending(true);
    setMessage('現在地を確認しています…');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        if (id !== requestId.current) return;
        setPending(false);
        const result = coordinatesSchema.safeParse({
          lat: p.coords.latitude,
          lon: p.coords.longitude,
        });
        if (!result.success) {
          setMessage('位置を確認できません。地域を選んでください。');
          return;
        }
        onLocated(result.data);
        setMessage('現在地を検索の基準にしました。');
      },
      (e) => {
        if (id !== requestId.current) return;
        setPending(false);
        setMessage(
          e.code === 1
            ? '位置情報が許可されていません。地域を選んで検索できます。'
            : '現在地を取得できませんでした。地域を選ぶか、もう一度お試しください。',
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }
  return { pending, message, locate, cancel };
}
