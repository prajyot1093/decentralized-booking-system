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
} from '@mui/material';
import {
  AccountBalanceWallet,
  Home,
  Hotel,
  BookOnline,
  Dashboard,
  ExitToApp,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const Navbar = () => {
  const navigate = useNavigate();
  const { 
    account, 
    isConnected, 
    connectWallet, 
    disconnectWallet, 
    formatAddress,
    chainId 
  } = useWeb3();
  
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    handleClose();
    navigate('/');
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 11155111: return 'Sepolia';
      case 137: return 'Polygon';
      case 1337: return 'Localhost';
      default: return 'Unknown';
    }
  };

  return (
    <AppBar position="static" className="gradient-bg">
      <Toolbar>
        {/* Logo */}
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          🎫 TicketChain
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            startIcon={<Home />}
          >
            Home
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/properties"
            startIcon={<Hotel />}
          >
            Stays
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/tickets"
            startIcon={<BookOnline />}
          >
            Tickets
          </Button>
          {isConnected && (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/my-bookings"
                startIcon={<BookOnline />}
              >
                My Bookings
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/my-properties"
                startIcon={<Dashboard />}
              >
                My Properties
              </Button>
            </>
          )}
        </Box>

        {/* Wallet Connection */}
        {!isConnected ? (
          <Button
            variant="contained"
            color="secondary"
            onClick={connectWallet}
            startIcon={<AccountBalanceWallet />}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Connect Wallet
          </Button>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Network Chip */}
            <Chip
              label={getNetworkName(chainId)}
              size="small"
              color="secondary"
              variant="outlined"
            />
            
            {/* Account Menu */}
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {account?.slice(2, 4).toUpperCase()}
              </Avatar>
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  {formatAddress(account)}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleDisconnect}>
                <ExitToApp sx={{ mr: 1 }} />
                Disconnect
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;