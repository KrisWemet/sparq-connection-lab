import React, { Component, ErrorInfo, ReactNode } from 'react';
import { PeterAvatar } from '@/components/dashboard/PeterAvatar';
import { reportPrimaryPathClientError } from '@/lib/beta/primaryPath';

interface Props {
  children: ReactNode;
  /** When this value changes (e.g. the route), a caught error is cleared. */
  resetKey?: string;
}

interface State {
  hasError: boolean;
}

/**
 * App-wide safety net for render errors. Without it, one thrown error in any
 * page unmounts the whole tree and leaves the user on a blank white screen.
 * The raw error is never shown to the user — only logged and reported.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught render error:', error, errorInfo);
    void reportPrimaryPathClientError('render', error, {
      component_stack: errorInfo.componentStack?.slice(0, 2000),
    });
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="flex max-w-sm flex-col items-center text-center">
          <PeterAvatar mood="curious" size={96} />
          <h1 className="mt-6 font-serif text-2xl text-brand-text-primary">
            Oops — I tripped over my tail.
          </h1>
          <p className="mt-2 text-brand-text-secondary">
            Something went sideways on this page. Your progress is safe. 🦦
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Try again
            </button>
            {/* Full reload on purpose: it clears whatever client state broke. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/dashboard"
              className="rounded-full border border-brand-border px-5 py-2.5 text-sm font-medium text-brand-text-primary transition-colors hover:bg-white/60"
            >
              Back home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
