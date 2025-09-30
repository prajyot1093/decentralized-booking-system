import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Box, Paper, Typography, LinearProgress, Chip, Fade } from '@mui/material';

const statusColor = (s) => ({
  pending: 'warning',
  mining: 'info',
  confirmed: 'success',
  error: 'error'
}[s] || 'default');

export default function TransactionPanel() {
  const { transactions } = useWeb3();
  if (!transactions.length) return null;
  return (
    <Fade in timeout={400}>
      <Paper elevation={6} sx={{ position: 'fixed', bottom: 16, right: 16, width: 340, maxHeight: 420, overflowY: 'auto', p: 2, backdropFilter: 'blur(8px)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Activity</Typography>
        {transactions.slice().reverse().map(t => (
          <Box key={t.id} sx={{ mb: 1.5, p: 1, borderRadius: 1, bgcolor: 'background.default', boxShadow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.summary || 'Transaction'}</Typography>
              <Chip size="small" label={t.status} color={statusColor(t.status)} />
            </Box>
            {t.status !== 'confirmed' && t.status !== 'error' && <LinearProgress sx={{ mt: 0.5 }} />}
            {t.hash && (
              <Typography variant="caption" component="a" href={`https://sepolia.etherscan.io/tx/${t.hash}`} target="_blank" rel="noreferrer" sx={{ textDecoration: 'none', display: 'block', mt: 0.5, color: 'primary.main' }}>
                {t.hash.slice(0, 10)}...{t.hash.slice(-6)}
              </Typography>
            )}
          </Box>
        ))}
      </Paper>
    </Fade>
  );
}
