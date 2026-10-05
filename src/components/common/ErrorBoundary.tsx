import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    (window as any).__LAST_REACT_ERROR__ = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    };
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 40,
            margin: '40px auto',
            maxWidth: 800,
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid #fecaca',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              !
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, color: '#991b1b' }}>Component Render Error</h2>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                An error occurred while rendering this page.
              </p>
            </div>
          </div>
          <div
            style={{
              padding: 16,
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 13,
              fontFamily: 'monospace',
              color: '#b91c1c',
              whiteSpace: 'pre-wrap',
              marginBottom: 16,
            }}
          >
            {this.state.error?.toString()}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
