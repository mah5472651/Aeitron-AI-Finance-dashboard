import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-danger" />
          </div>
          <h2 className="text-lg font-semibold text-text mb-1">Something went wrong</h2>
          <p className="text-sm text-text-muted mb-4 max-w-md">
            An unexpected error occurred. Try refreshing this section.
          </p>
          {this.state.error && (
            <pre className="text-xs text-text-muted/60 bg-bg border border-border rounded-lg p-3 mb-4 max-w-md overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
