import React from 'react';
import { Alert, Box, Button, Chip } from '@mui/material';
import { CloudOff, Wifi, Refresh } from '@mui/icons-material';

/**
 * Offline status banner component
 */
export default function OfflineBanner({
  isOnline = true,
  usingCachedData = false,
  lastUpdated = null,
  onRefresh = null,
  showDetails = true
}) {
  if (isOnline && !usingCachedData) {
    return null; // No banner needed when online with fresh data
  }

  const getBannerProps = () => {
    if (!isOnline) {
      return {
        severity: 'error',
        icon: <CloudOff />,
        title: 'You are currently offline',
        message: 'Showing cached data. Some features may be limited.',
        color: 'error'
      };
    } else if (usingCachedData) {
      return {
        severity: 'warning',
        icon: <Wifi />,
        title: 'Showing cached data',
        message: 'Unable to fetch latest updates from server.',
        color: 'warning'
      };
    }
  };

  const { severity, icon, title, message, color } = getBannerProps();

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Alert 
      severity={severity}
      icon={icon}
      sx={{ 
        mb: 2,
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
      action={
        <Box display="flex" gap={1} alignItems="center">
          {showDetails && lastUpdated && (
            <Chip
              size="small"
              label={`Updated: ${formatLastUpdated(lastUpdated)}`}
              color={color}
              variant="outlined"
            />
          )}
          {onRefresh && isOnline && (
            <Button
              color="inherit"
              size="small"
              onClick={onRefresh}
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          )}
        </Box>
      }
    >
      <Box>
        <strong>{title}</strong>
        {message && (
          <Box component="div" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
            {message}
          </Box>
        )}
      </Box>
    </Alert>
  );
}