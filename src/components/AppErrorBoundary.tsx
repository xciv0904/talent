import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { failed: boolean }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The UI intentionally avoids logging assessment data or answers.
  }

  private retry = () => window.location.reload();

  private clearProgress = async () => {
    if (!window.confirm('確定清除目前測驗進度與結果？這個動作無法復原。')) return;
    const { resetAssessment } = await import('../services/storage');
    resetAssessment();
    window.location.assign('/discover');
  };

  render() {
    if (this.state.failed) {
      return <main className="grid min-h-screen place-items-center bg-cream px-5 text-center text-ink"><div className="max-w-xl"><p className="eyebrow text-slate-500">頁面暫時無法顯示</p><h1 className="mt-5 font-serif text-4xl font-normal">你的進度仍保留在這個瀏覽器。</h1><p className="mt-4 leading-7 text-ink/60">請先重新載入頁面。只有反覆無法恢復時，才需要手動清除這次進度。</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button type="button" onClick={this.retry} className="min-h-12 rounded-full bg-ink px-6 font-semibold text-white">重新載入</button><button type="button" onClick={this.clearProgress} className="min-h-12 rounded-full border border-slate-300 bg-white px-6 font-semibold">清除進度並返回首頁</button></div></div></main>;
    }
    return this.props.children;
  }
}
