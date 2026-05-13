import { Component, ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
};

type State = { error: Error | null };

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, reset: this.reset });
      }
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4 border border-border rounded-lg p-6 bg-card">
            <h2 className="font-serif text-2xl">Something went wrong</h2>
            <p className="text-sm text-muted-foreground break-words">
              {this.state.error.message || "An unexpected error occurred."}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  this.reset();
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90"
              >
                Reload page
              </button>
              <button
                onClick={this.reset}
                className="px-4 py-2 rounded-md border border-border text-sm hover:bg-muted"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
