import { Component, type ErrorInfo, type ReactNode } from 'react';
import { resetAssessment } from '../services';

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

  private recover = () => {
    resetAssessment();
    window.location.assign('/discover');
  };

  render() {
    if (this.state.failed) {
      return <main className="grid min-h-screen place-items-center bg-cream px-5 text-center text-ink"><div className="max-w-xl"><p className="eyebrow text-slate-500">Unable to restore this session</p><h1 className="mt-5 font-serif text-4xl font-normal">目前的探索資料無法正確顯示。</h1><p className="mt-4 leading-7 text-ink/60">可能是瀏覽器中的舊資料格式損壞。你可以清除這次進度並回到首頁；職涯資料與評分規則不會被修改。</p><button type="button" onClick={this.recover} className="mt-7 min-h-12 rounded-full bg-ink px-6 font-semibold text-white">清除損壞進度並返回首頁</button></div></main>;
    }
    return this.props.children;
  }
}
