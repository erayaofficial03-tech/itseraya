import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Catches lazy-route chunk-load failures (common after deploys or flaky
 * networks) and shows a friendly retry UI instead of a blank screen.
 */
class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("ChunkErrorBoundary caught:", error);
  }

  private isChunkError(err: Error) {
    const msg = err?.message || "";
    return /Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed/i.test(
      msg
    );
  }

  reset = () => this.setState({ error: null });

  hardReload = () => {
    try {
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunk = this.isChunkError(error);
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 border border-border rounded-lg p-6 bg-card">
          <h2 className="font-serif text-2xl">
            {chunk ? "Couldn't load this page" : "Something went wrong"}
          </h2>
          <p className="text-sm text-muted-foreground break-words">
            {chunk
              ? "A network hiccup stopped this page from loading. Please retry or refresh."
              : error.message || "An unexpected error occurred."}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={this.reset}
              className="px-4 py-2 rounded-md border border-border text-sm hover:bg-muted"
            >
              Try again
            </button>
            <button
              onClick={this.hardReload}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90"
            >
              Refresh page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ChunkErrorBoundary;
