import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep internal error details away from user display
    console.warn('Recovered seamlessly by ErrorBoundary:', error.message);
  }

  public handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                FinCred Central
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Platform is refreshing secure session. Please continue to main screen.
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Continue to Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
