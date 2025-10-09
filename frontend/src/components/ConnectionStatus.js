// Connection Status Component
import React from 'react';
import { Box, Chip, Tooltip, IconButton } from '@mui/material';
import { 
  WifiOff, 
  CloudDone, 
  CloudOff, 
  Refresh,
  Warning 
} from '@mui/icons-material';
import { useConnectivity } from '../context/ConnectivityContext';

const ConnectionStatus = () => {
  const { 
    isOnline, 
    backendStatus, 
    errors, 
    checkHealth 
  } = useConnectivity();

  const getStatusColor = () => {
    if (!isOnline) return 'error';
    if (backendStatus === 'connected') return 'success';
    if (backendStatus === 'checking') return 'warning';
    return 'error';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff fontSize="small" />;
    if (backendStatus === 'connected') return <CloudDone fontSize="small" />;
    if (backendStatus === 'checking') return <Warning fontSize="small" />;
    return <CloudOff fontSize="small" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (backendStatus === 'connected') return 'Connected';
    if (backendStatus === 'checking') return 'Connecting...';
    return 'Disconnected';
  };

  const getTooltipText = () => {
    if (!isOnline) return 'No internet connection';
    if (backendStatus === 'connected') return 'All systems operational';
    if (backendStatus === 'checking') return 'Checking backend connection';
    return 'Backend service unavailable - using cached data';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={getTooltipText()}>
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor()}
          variant="outlined"
          size="small"
          sx={{ 
            borderRadius: '16px',
            '& .MuiChip-icon': {
              fontSize: '16px'
            }
          }}
        />
      </Tooltip>
      
      {errors.length > 0 && (
        <Tooltip title={`${errors.length} connection ${errors.length === 1 ? 'issue' : 'issues'}`}>
          <Chip
            icon={<Warning fontSize="small" />}
            label={errors.length}
            color="error"
            variant="outlined"
            size="small"
          />
        </Tooltip>
      )}
      
      {(backendStatus === 'disconnected' || errors.length > 0) && (
        <Tooltip title="Retry connection">
          <IconButton
            size="small"
            onClick={checkHealth}
            sx={{ 
              width: 28, 
              height: 28,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ConnectionStatus;