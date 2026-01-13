# Task: Add Error Boundaries

## Context
If a component throws, the whole app crashes. Add Error Boundaries for graceful degradation.

## Files to Create/Modify
- Create error boundary component
- Wrap major sections in App.tsx

## What to Build

1. Create ErrorBoundary component:
```tsx
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-slate-400 mb-4">Please refresh the page</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

2. Wrap major sections:
```tsx
<ErrorBoundary>
  <GameShellV2>
    {children}
  </GameShellV2>
</ErrorBoundary>
```

3. Add granular boundaries for:
- Each Space page content
- Modal contents
- Form components

## Success Criteria
- [ ] ErrorBoundary component created
- [ ] Major sections wrapped
- [ ] Graceful error UI shown on crash
- [ ] Build passes
