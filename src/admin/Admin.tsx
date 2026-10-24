import { useState } from 'react';
import { categories, costs } from '../lib/config';
import type { Dataset, Spot } from '../lib/validation';
import styles from './Admin.module.css';

type Stored = { revision: number; data: Dataset };
function blank(): Spot {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: '',
    name: '',
    category: 'park',
    cost: 'unknown',
    lat: 35.1709,
    lon: 136.9084,
    address: '',
    conditions: '',
    facilities: [],
    sourceUrl: '',
    sourceLabel: '',
    rights: '',
    verifiedAt: today,
    validUntil: today,
    published: true,
    fixture: false,
  };
}

export default function Admin() {
  const [token, setToken] = useState('');
  const [record, setRecord] = useState<Stored | null>(null);
  const [draft, setDraft] = useState<Spot>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function request(method: 'GET' | 'PUT', body?: unknown): Promise<Stored> {
    const response = await fetch('/api/admin/spots', {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: 'no-store',
    });
    const payload: unknown = await response.json();
    if (!response.ok) {
      throw new Error(
        payload && typeof payload === 'object' && 'error' in payload
          ? String(payload.error)
          : '操作に失敗しました',
      );
    }
    return payload as Stored;
  }

  async function login() {
    setBusy(true);
    setMessage('');
    try {
      setRecord(await request('GET'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '認証できませんでした');
    } finally {
      setBusy(false);
    }
  }

  function change<K extends keyof Spot>(field: K, value: Spot[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function startEdit(spot: Spot) {
    setEditing(spot.id);
    setDraft({ ...spot });
    setMessage('');
  }

  function startAdd() {
    setEditing(null);
    setDraft(blank());
    setMessage('');
  }

  async function save(nextSpots: Spot[]) {
    if (!record) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await request('PUT', {
        revision: record.revision,
        data: { schemaVersion: 1, spots: nextSpots },
      });
      setRecord(result);
      startAdd();
      setMessage('DBへ保存しました。公開地図にも反映されます。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存できませんでした');
    } finally {
      setBusy(false);
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!record) return;
    const next = editing
      ? record.data.spots.map((s) => (s.id === editing ? draft : s))
      : [...record.data.spots, draft];
    void save(next);
  }

  function remove(spot: Spot) {
    if (!record || !window.confirm(`${spot.name}をDBから削除します。元に戻すには再登録が必要です。続けますか？`)) return;
    void save(record.data.spots.filter((s) => s.id !== spot.id));
  }

  function exportBackup() {
    if (!record) return;
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `lespot-db-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <a href="/">LeSpotへ戻る</a>
        <strong>LeSpot 管理</strong>
      </header>
      {!record ? (
        <section className={styles.login}>
          <h1>スポット管理</h1>
          <p>更新権限を持つ運営者専用の画面です。認証キーはこの画面のメモリだけに保持します。</p>
          <form onSubmit={(event) => { event.preventDefault(); void login(); }}>
            <label>
              管理キー
              <input
                type="password"
                autoComplete="off"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={busy || !token}>ログイン</button>
          </form>
        </section>
      ) : (
        <>
          <div className={styles.heading}>
            <div>
              <h1>スポット管理</h1>
              <p>DB登録数：{record.data.spots.length}件 · リビジョン {record.revision}</p>
            </div>
            <div className={styles.toolbar}>
              <button type="button" onClick={exportBackup}>JSONバックアップを保存</button>
              <button type="button" onClick={() => { setRecord(null); setToken(''); startAdd(); }}>ログアウト</button>
            </div>
          </div>
          <div className={styles.columns}>
            <section className={styles.list}>
              <div className={styles.sectionTitle}>
                <h2>登録済みの場所</h2>
                <button type="button" onClick={startAdd}>新規登録</button>
              </div>
              {record.data.spots.map((spot) => (
                <div className={styles.spotRow} key={spot.id}>
                  <div><strong>{spot.name}</strong><small>{spot.address}</small></div>
                  <div>
                    <button type="button" onClick={() => startEdit(spot)}>編集</button>
                    <button type="button" onClick={() => remove(spot)} disabled={busy}>削除</button>
                  </div>
                </div>
              ))}
            </section>
            <section className={styles.editor}>
              <h2>{editing ? 'スポットを編集' : '新しいスポットを追加'}</h2>
              <form onSubmit={submit}>
                <div className={styles.two}>
                  <label>
                    ID（英小文字・数字・ハイフン）
                    <input required pattern="[a-z0-9][a-z0-9-]{0,63}" value={draft.id}
                      disabled={Boolean(editing)} onChange={(e) => change('id', e.target.value)} />
                  </label>
                  <label>
                    名称
                    <input required maxLength={600} value={draft.name} onChange={(e) => change('name', e.target.value)} />
                  </label>
                </div>
                <div className={styles.two}>
                  <label>
                    カテゴリ
                    <select value={draft.category} onChange={(e) => change('category', e.target.value as Spot['category'])}>
                      {Object.entries(categories).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                  </label>
                  <label>
                    料金
                    <select value={draft.cost} onChange={(e) => change('cost', e.target.value as Spot['cost'])}>
                      {Object.entries(costs).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                  </label>
                </div>
                <label>住所<input required value={draft.address} onChange={(e) => change('address', e.target.value)} /></label>
                <div className={styles.two}>
                  <label>緯度<input type="number" step="any" min={34.8} max={35.5} required value={draft.lat} onChange={(e) => change('lat', Number(e.target.value))} /></label>
                  <label>経度<input type="number" step="any" min={136.5} max={137.3} required value={draft.lon} onChange={(e) => change('lon', Number(e.target.value))} /></label>
                </div>
                <label>休憩利用条件<textarea required rows={3} maxLength={600} value={draft.conditions} onChange={(e) => change('conditions', e.target.value)} /></label>
                <label>確認済み設備（1行に1件）<textarea rows={3} value={draft.facilities.join('\n')} onChange={(e) => change('facilities', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} /></label>
                <label>出典URL（HTTPS）<input type="url" required value={draft.sourceUrl} onChange={(e) => change('sourceUrl', e.target.value)} /></label>
                <label>出典名<input required value={draft.sourceLabel} onChange={(e) => change('sourceLabel', e.target.value)} /></label>
                <label>出典の権利・利用根拠<textarea required rows={3} value={draft.rights} onChange={(e) => change('rights', e.target.value)} /></label>
                <div className={styles.two}>
                  <label>確認日<input type="date" required value={draft.verifiedAt} onChange={(e) => change('verifiedAt', e.target.value)} /></label>
                  <label>確認期限<input type="date" required value={draft.validUntil} onChange={(e) => change('validUntil', e.target.value)} /></label>
                </div>
                <p className={styles.help}>実在するスポットのみ登録してください。公開情報は保存後にDBから配信されます。変更前にバックアップを推奨します。</p>
                <button type="submit" className={styles.save} disabled={busy}>
                  {busy ? '保存中…' : editing ? '変更を保存' : 'スポットを登録'}
                </button>
              </form>
            </section>
          </div>
        </>
      )}
      <p role="status" className={styles.status}>{message}</p>
    </main>
  );
}
