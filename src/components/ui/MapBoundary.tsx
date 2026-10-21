import { Component, type ReactNode } from 'react';
import { StatusPanel } from './StatusPanel';
export class MapBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <StatusPanel error title="地図を表示できません">
        一覧と外部地図リンクは引き続き利用できます。再読み込みで地図を再試行できます。
      </StatusPanel>
    ) : (
      this.props.children
    );
  }
}
