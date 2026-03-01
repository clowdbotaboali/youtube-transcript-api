import { Component } from 'react';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI runtime error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center">
            <h1 className="text-xl font-black mb-3">حدث خطأ غير متوقع في الواجهة</h1>
            <p className="text-slate-300 text-sm mb-6">
              رجاءً حدّث الصفحة ثم أعد المحاولة.
              <br />
              An unexpected UI error occurred. Refresh and try again.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-xl px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
            >
              تحديث الصفحة / Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
