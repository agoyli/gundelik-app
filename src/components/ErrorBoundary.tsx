import { Box, Button, Typography } from '@mui/material';
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { tokens } from '../theme';

/*
 * Without this, any render error paints a blank white phone with no way out.
 * Keeps the failure inside the frame and offers a reload.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Gündelik screen crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Box sx={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '10px', px: '32px', textAlign: 'center',
      }}>
        <Typography variant="h2">Bir zat bozuldy</Typography>
        <Typography variant="body2" sx={{ color: tokens.ink3 }}>
          Sahypany täzeden açyp görüň.
        </Typography>
        <Button variant="contained" disableElevation sx={{ mt: '10px', px: '28px' }}
          onClick={() => window.location.reload()}>
          Täzeden aç
        </Button>
      </Box>
    );
  }
}
