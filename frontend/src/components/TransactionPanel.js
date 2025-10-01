import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Box, Paper, Typography, LinearProgress, Chip, Fade, IconButton, Tooltip, Divider, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const statusColor = (s) => ({
  pending: 'warning',
  mining: 'info',
  confirmed: 'success',
  error: 'error'
}[s] || 'default');

export default function TransactionPanel() {
  const { transactions } = useWeb3();
  const [collapsed, setCollapsed] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const grouped = React.useMemo(() => {
    const g = { pending: [], mining: [], confirmed: [], error: [] };
    for (const tx of transactions) {
      (g[tx.status] || (g[tx.status] = [])).push(tx);
    }
    return g;
  }, [transactions]);
  const total = transactions.length;
  if (!total || hidden) return null;
  return (
    <Fade in timeout={400}>
      <Paper elevation={6} sx={{ position: 'fixed', bottom: 16, right: 16, width: 360, maxHeight: 480, display:'flex', flexDirection:'column', backdropFilter: 'blur(10px)', background: 'rgba(20,28,42,0.85)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.5)', zIndex:1500 }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', p:1.2, pb:0.6 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '.5px' }}>Activity ({total})</Typography>
          <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
            <Tooltip title={collapsed ? 'Expand' : 'Collapse'} arrow>
              <IconButton size="small" onClick={() => setCollapsed(c => !c)} sx={{ color:'text.secondary' }}>
                {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Hide" arrow>
              <IconButton size="small" onClick={() => setHidden(true)} sx={{ color:'text.secondary' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Divider sx={{ opacity:.3 }} />
        <Collapse in={!collapsed} timeout={300} unmountOnExit>
          <Box sx={{ overflowY:'auto', p:1.2, pt:1, display:'flex', flexDirection:'column', gap:1 }}>
            {(['pending','mining','confirmed','error']).map(statusKey => {
              const list = grouped[statusKey];
              if (!list?.length) return null;
              return (
                <Box key={statusKey} sx={{ border:'1px solid rgba(255,255,255,0.06)', borderRadius:1.5, p:1, backdropFilter:'blur(4px)', background:'rgba(0,0,0,0.15)' }}>
                  <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:0.5 }}>
                    <Typography variant="caption" sx={{ textTransform:'uppercase', fontWeight:600, letterSpacing:'.5px', color:'text.secondary' }}>{statusKey} • {list.length}</Typography>
                    <Chip size="small" label={statusKey} color={statusColor(statusKey)} />
                  </Box>
                  {list.slice().reverse().map(t => (
                    <Box key={t.id} sx={{ mb:0.75, p:0.75, borderRadius:1, bgcolor:'background.default', boxShadow:'0 0 0 1px rgba(255,255,255,0.04)' }}>
                      <Typography variant="caption" sx={{ display:'block', fontWeight:500, maxWidth:230, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.summary || 'Transaction'}</Typography>
                      {t.status !== 'confirmed' && t.status !== 'error' && <LinearProgress sx={{ mt:0.5 }} />}
                      {t.hash && (
                        <Typography variant="caption" component="a" href={`https://sepolia.etherscan.io/tx/${t.hash}`} target="_blank" rel="noreferrer" sx={{ textDecoration:'none', display:'inline-block', mt:0.5, color:'primary.main' }}>
                          {t.hash.slice(0, 10)}...{t.hash.slice(-6)}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              );
            })}
          </Box>
        </Collapse>
      </Paper>
    </Fade>
  );
}
