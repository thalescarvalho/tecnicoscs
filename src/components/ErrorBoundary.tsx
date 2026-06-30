import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[ErrorBoundary] crash:', error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 shadow-lg space-y-4">
            <h1 className="text-xl font-bold text-destructive">Ocorreu um erro</h1>
            <p className="text-sm text-muted-foreground">A tela travou. Toque em "Recarregar" para voltar.</p>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48 whitespace-pre-wrap break-words">
              {this.state.error.message}
              {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
            </pre>
            <div className="flex gap-2">
              <button
                onClick={() => { this.reset(); window.location.reload(); }}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                Recarregar
              </button>
              <button
                onClick={() => { this.reset(); window.history.back(); }}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
