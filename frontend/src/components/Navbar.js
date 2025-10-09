import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Home,
  Hotel,
  BookOnline,
  Dashboard,
  ExitToApp,
  TrendingUp,
  Settings,
  InfoOutlined,
  SupportAgent,
  LightMode,
  DarkMode,
  TravelExplore,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useThemeMode } from '../context/ThemeModeContext';
import ConnectionStatus from './ConnectionStatus';

const Navbar = () => {
  const navigate = useNavigate();
  const { account, isConnected, connectWallet, disconnectWallet, formatAddress, chainId, getBalance } = useWeb3();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileEl, setMobileEl] = React.useState(null);
  const { mode: themeMode, toggleTheme } = useThemeMode();
  const [balance, setBalance] = React.useState(null);

  React.useEffect(() => { (async () => { if (isConnected) { try { const b = await getBalance(); setBalance(parseFloat(b).toFixed(4)); } catch {} } })(); }, [isConnected, getBalance]);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);
  const openMobile = (e) => setMobileEl(e.currentTarget);
  const closeMobile = () => setMobileEl(null);
  const handleThemeClick = (e) => {
    // Pass click coordinates for blast animation
    toggleTheme(e.clientX, e.clientY);
  };

  const handleDisconnect = () => { disconnectWallet(); closeMenu(); navigate('/'); };

  const getNetworkName = (id) => ({ 1:'Ethereum', 11155111:'Sepolia', 137:'Polygon', 1337:'Localhost' }[id] || 'Unknown');

  return (
    <AppBar position="sticky" elevation={0} className="gradient-bg" sx={{ borderBottom:'1px solid rgba(255,255,255,0.08)', background:'rgba(10,14,25,0.78)', backdropFilter:'blur(18px) saturate(160%)' }}>
      <Toolbar sx={{ py: 1, gap: 2 }}>
        {/* Logo */}
        <Typography component={Link} to="/" variant="h6" sx={{ flexGrow:1, textDecoration:'none', fontWeight:800, letterSpacing:'0.5px', display:'flex', alignItems:'center', gap:1, background:'linear-gradient(120deg,#00e5ff,#ff29e6,#8f6eff)', WebkitBackgroundClip:'text', color:'transparent', filter:'drop-shadow(0 0 6px rgba(0,229,255,0.35))' }}>
          🎫 TicketChain
          <Badge color="secondary" variant="dot" overlap="circular" sx={{ '& .MuiBadge-badge': { boxShadow:'0 0 0 2px #0a0e19', animation:'glowPulse 4s infinite' } }} />
        </Typography>

        {/* Desktop Nav */}
        <Box sx={{ display:{ xs:'none', md:'flex'}, gap:1.2 }}>
          <Button component={Link} to="/" size="small" color="inherit" className="nav-link-underline">Home</Button>
            <Button component={Link} to="/tickets" size="small" color="inherit" className="nav-link-underline">Tickets</Button>
            <Button component={Link} to="/properties" size="small" color="inherit" className="nav-link-underline">Stays</Button>
            <Button component={Link} to="/analytics" size="small" color="inherit" className="nav-link-underline">Analytics</Button>
            <Button component={Link} to="/explore" size="small" color="inherit" className="nav-link-underline">Explore</Button>
            <Button component={Link} to="/support" size="small" color="inherit" className="nav-link-underline">Support</Button>
            {isConnected && <Button component={Link} to="/my-bookings" size="small" color="inherit" className="nav-link-underline">Dashboard</Button>}
        </Box>

        {/* Mobile trigger */}
        <Box sx={{ display:{ xs:'flex', md:'none' } }}>
          <Button variant="outlined" size="small" onClick={openMobile} sx={{ borderColor:'rgba(255,255,255,0.25)', color:'#fff' }}>Menu</Button>
        </Box>

        {/* Connection Status */}
        <ConnectionStatus />

        {/* Wallet / Actions */}
        {!isConnected ? (
          <Button variant="contained" color="secondary" startIcon={<AccountBalanceWallet />} onClick={connectWallet} sx={{ borderRadius:3, fontWeight:600 }}>
            Connect
          </Button>
        ) : (
          <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
            <Chip label={getNetworkName(chainId)} size="small" color="secondary" variant="outlined" />
            {balance && <Chip label={`${balance} ETH`} size="small" variant="outlined" sx={{ color:'var(--neon-cyan)', borderColor:'rgba(255,255,255,0.2)' }} />}
            <Tooltip title="Toggle theme" arrow>
              <IconButton size="small" onClick={handleThemeClick} sx={{ color:'var(--neon-cyan)' }}>{themeMode==='dark'?<LightMode fontSize="small" />:<DarkMode fontSize="small" />}</IconButton>
            </Tooltip>
            <Tooltip title="Settings" arrow>
              <IconButton size="small" component={Link} to="/settings" sx={{ color:'var(--neon-pink)' }}>
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={handleMenu} className="pulse-ring" sx={{ p:0.5 }}>
              <Avatar sx={{ width:36, height:36, bgcolor:'secondary.main', fontSize:14, fontWeight:600 }}>{account?.slice(2,4).toUpperCase()}</Avatar>
            </IconButton>
          </Box>
        )}
      </Toolbar>

      {/* Account Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu} anchorOrigin={{vertical:'bottom', horizontal:'right'}} transformOrigin={{vertical:'top', horizontal:'right'}} PaperProps={{ sx:{ minWidth:230, p:1, background:'rgba(15,20,35,0.92)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,0.08)' }}}>
        <MenuItem disabled><Typography variant="body2" sx={{ fontFamily:'monospace' }}>{formatAddress(account)}</Typography></MenuItem>
        <Divider sx={{ my:0.5, borderColor:'rgba(255,255,255,0.1)' }} />
        <MenuItem component={Link} to="/portfolio" onClick={closeMenu}>Portfolio</MenuItem>
        <MenuItem component={Link} to="/rewards" onClick={closeMenu}>Rewards</MenuItem>
        <MenuItem component={Link} to="/settings" onClick={closeMenu}>Settings</MenuItem>
        <MenuItem component={Link} to="/about" onClick={closeMenu}><InfoOutlined fontSize="small" style={{marginRight:8}} /> About</MenuItem>
        <Divider sx={{ my:0.5, borderColor:'rgba(255,255,255,0.1)' }} />
        <MenuItem onClick={handleDisconnect} sx={{ color:'var(--neon-pink)' }}><ExitToApp fontSize="small" style={{marginRight:8}} /> Disconnect</MenuItem>
      </Menu>

      {/* Mobile Menu */}
      <Menu anchorEl={mobileEl} open={Boolean(mobileEl)} onClose={closeMobile} PaperProps={{ sx:{ width:240, background:'rgba(15,20,35,0.95)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,255,255,0.08)' }}}>
        <MenuItem component={Link} to="/" onClick={closeMobile}><Home fontSize="small" style={{marginRight:8}} /> Home</MenuItem>
        <MenuItem component={Link} to="/tickets" onClick={closeMobile}><BookOnline fontSize="small" style={{marginRight:8}} /> Tickets</MenuItem>
        <MenuItem component={Link} to="/properties" onClick={closeMobile}><Hotel fontSize="small" style={{marginRight:8}} /> Stays</MenuItem>
        <MenuItem component={Link} to="/explore" onClick={closeMobile}><TravelExplore fontSize="small" style={{marginRight:8}} /> Explore</MenuItem>
        <MenuItem component={Link} to="/analytics" onClick={closeMobile}><TrendingUp fontSize="small" style={{marginRight:8}} /> Analytics</MenuItem>
        <MenuItem component={Link} to="/support" onClick={closeMobile}><SupportAgent fontSize="small" style={{marginRight:8}} /> Support</MenuItem>
        {isConnected && <MenuItem component={Link} to="/my-bookings" onClick={closeMobile}><Dashboard fontSize="small" style={{marginRight:8}} /> Dashboard</MenuItem>}
      </Menu>
    </AppBar>
  );
};

export default Navbar;