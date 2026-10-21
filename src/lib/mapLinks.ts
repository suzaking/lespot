import type { Spot } from './validation';
function url(base: string, params: Record<string, string>): string {
  const u = new URL(base);
  u.search = new URLSearchParams(params).toString();
  return u.toString();
}
export function mapLinks(s: Spot): { label: string; href: string }[] {
  const point = `${s.lat},${s.lon}`;
  return [
    {
      label: 'Googleマップで施設を検索',
      href: url('https://www.google.com/maps/search/', {
        api: '1',
        query: `${s.name} ${s.address}`,
      }),
    },
    {
      label: '徒歩ルート',
      href: url('https://www.google.com/maps/dir/', {
        api: '1',
        destination: point,
        travelmode: 'walking',
      }),
    },
    {
      label: '周辺のStreet View',
      href: url('https://www.google.com/maps/@', {
        api: '1',
        map_action: 'pano',
        viewpoint: point,
      }),
    },
    {
      label: '位置をGoogleマップで確認',
      href: url('https://www.google.com/maps/search/', {
        api: '1',
        query: point,
      }),
    },
    {
      label: 'Appleマップ',
      href: url('https://maps.apple.com/', { ll: point, q: s.name }),
    },
  ];
}
