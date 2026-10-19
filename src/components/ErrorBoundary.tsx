import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('VectorMotion Uncaught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-zinc-950 text-zinc-100 p-6 select-text">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-bold text-zinc-100">Error al iniciar VectorMotion Studio</h2>
            <p className="text-xs text-zinc-400">
              Ocurrió un error inesperado al renderizar la interfaz. Puedes intentar recargar la aplicación o restaurar el estado inicial.
            </p>

            {this.state.error && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-left max-h-36 overflow-auto custom-scrollbar">
                <p className="text-xs font-mono text-rose-400 font-semibold break-all">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-[10px] font-mono text-zinc-500 mt-2 whitespace-pre-wrap">
                    {this.state.error.stack.slice(0, 400)}...
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-blue-600/30 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recargar App</span>
              </button>

              <button
                onClick={this.handleClearAndReload}
                className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium py-2.5 px-3 rounded-xl transition-all cursor-pointer"
                title="Limpiar datos guardados y recargar"
              >
                <Trash2 className="w-4 h-4 text-zinc-400" />
                <span>Restaurar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
