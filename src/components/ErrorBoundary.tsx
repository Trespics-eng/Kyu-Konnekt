import React from 'react';

type State = { error: Error | null };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[KyU frontend render error]', { message: error.message, stack: error.stack, componentStack: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ maxWidth: 640, margin: '10vh auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
          <h1>KyU Connect hit an error</h1>
          <p>The page could not render. Reload to try again.</p>
          <details>
            <summary>Error details</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload page</button>
        </main>
      );
    }
    return this.props.children;
  }
}
