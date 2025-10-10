import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
  Chip
} from '@mui/material';
import { Warning, CheckCircle, Error } from '@mui/icons-material';

/**
 * Network mismatch modal component
 */
export default function NetworkMismatchModal({
  open,
  onClose,
  currentChainId,
  targetChainId,
  targetNetworkName,
  onSwitchNetwork
}) {
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState(null);

  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet',
      56: 'BSC Mainnet',
      97: 'BSC Testnet',
      31337: 'Local Network'
    };
    return networks[chainId] || `Network ${chainId}`;
  };

  const handleSwitchNetwork = async () => {
    if (!onSwitchNetwork) return;

    setSwitching(true);
    setSwitchError(null);

    try {
      await onSwitchNetwork(targetChainId);
      // If successful, modal should close automatically when chainId changes
    } catch (error) {
      console.error('Failed to switch network:', error);
      
      let errorMessage = 'Failed to switch network. ';
      
      if (error.code === 4902) {
        errorMessage += 'The network is not added to your wallet. Please add it manually.';
      } else if (error.code === -32002) {
        errorMessage += 'A request is already pending. Please check your wallet.';
      } else if (error.code === 4001) {
        errorMessage += 'You rejected the network switch request.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      setSwitchError(errorMessage);
    } finally {
      setSwitching(false);
    }
  };

  // Clear error when modal opens
  useEffect(() => {
    if (open) {
      setSwitchError(null);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Warning color="warning" />
        Network Mismatch Detected
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          You're connected to the wrong network. Please switch to continue using the application.
        </Alert>

        <Box mb={3}>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Current Network:
          </Typography>
          <Chip
            icon={<Error />}
            label={getNetworkName(currentChainId)}
            color="error"
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Required Network:
          </Typography>
          <Chip
            icon={<CheckCircle />}
            label={targetNetworkName || getNetworkName(targetChainId)}
            color="success"
            variant="outlined"
          />
        </Box>

        {switchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {switchError}
          </Alert>
        )}

        <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Manual Network Switch:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            1. Open your wallet (MetaMask, etc.)
            <br />
            2. Click on the network dropdown
            <br />
            3. Select "{targetNetworkName || getNetworkName(targetChainId)}"
            <br />
            4. Refresh this page if needed
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={switching}>
          Cancel
        </Button>
        
        {onSwitchNetwork && (
          <Button
            variant="contained"
            onClick={handleSwitchNetwork}
            disabled={switching}
            startIcon={switching ? <CircularProgress size={16} /> : null}
          >
            {switching ? 'Switching...' : 'Switch Network'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}