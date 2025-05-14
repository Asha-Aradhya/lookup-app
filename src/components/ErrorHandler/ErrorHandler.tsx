/* Copyright (c) 2025. All Rights Reserved. All information in this file is Confidential and Proprietary. */

import React from 'react';

interface errorHandlerProps {
    children: React.ReactNode;
  }
  
  interface errorHandlerState {
    hasError: boolean;
    error: Error | null;
  }

class ErrorHandler extends React.Component<
errorHandlerProps,
errorHandlerState
> {
  constructor(props:errorHandlerProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error:errorHandlerState) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error:Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service if needed
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", color: "red" }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.toString()}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorHandler;
