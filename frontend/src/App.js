import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Properties from './pages/Properties';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import MyProperties from './pages/MyProperties';
import Tickets from './pages/Tickets';

// Context
import { Web3Provider, useWeb3 } from './context/Web3Context';
import TransactionPanel from './components/TransactionPanel';

function ThemedAppContainer() {
  const { chainId } = useWeb3();
  const theme = useMemo(() => {
    const networkPalette = {
      1: { primary: '#2962ff', secondary: '#ff4081' },       // Ethereum
      11155111: { primary: '#512da8', secondary: '#ff6e40' }, // Sepolia
      137: { primary: '#8247e5', secondary: '#ffb347' },      // Polygon
      1337: { primary: '#0277bd', secondary: '#ff4081' },     // Local
    }[chainId] || { primary: '#1976d2', secondary: '#dc004e' };
    let t = createTheme({
      palette: {
        mode: 'light',
        primary: { main: networkPalette.primary },
        secondary: { main: networkPalette.secondary },
        background: { default: '#f5f6fa', paper: '#ffffffdd' }
      },
      shape: { borderRadius: 12 },
      typography: { fontFamily: 'Inter, Roboto, sans-serif' },
      components: {
        MuiPaper: { styleOverrides: { root: { backdropFilter: 'blur(6px)' } } },
        MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } }
      }
    });
    t = responsiveFontSizes(t);
    return t;
  }, [chainId]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/book/:propertyId" element={<BookingForm />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-properties" element={<MyProperties />} />
          <Route path="/tickets" element={<Tickets />} />
        </Routes>
        <TransactionPanel />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1f1f28', color: '#fff', borderRadius: 12 }
          }}
        />
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Web3Provider>
        <Router>
          <ThemedAppContainer />
        </Router>
      </Web3Provider>
    </ErrorBoundary>
  );
}

export default App;