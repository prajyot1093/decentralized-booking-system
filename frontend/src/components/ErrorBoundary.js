import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home, Refresh } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" color="error" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              We encountered an unexpected error. Please try refreshing the page.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
                sx={{ borderRadius: '20px' }}
              >
                Refresh Page
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={() => window.location.href = '/'}
                sx={{ borderRadius: '20px' }}
              >
                Go Home
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2, textAlign: 'left' }}>
                <Typography variant="body2" color="error">
                  <strong>Error Details:</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                  {this.state.error?.toString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;