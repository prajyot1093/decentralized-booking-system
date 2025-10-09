import React, { useMemo, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
// Components & context (all imports must come before any other statements for eslint import/first)
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import TransactionPanel from './components/TransactionPanel';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import { ThemeModeProvider, useThemeMode } from './context/ThemeModeContext';
import { ConnectivityProvider } from './context/ConnectivityContext';
import { buildTheme } from './theme/createMuiTheme';

// Lazy pages (declared after all import statements to satisfy import/first rule)
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const BookingForm = lazy(() => import('./pages/BookingForm'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const MyProperties = lazy(() => import('./pages/MyProperties'));
const Tickets = lazy(() => import('./pages/Tickets'));
const BlockchainServices = lazy(() => import('./components/BlockchainServices'));

function ThemedAppContainer() {
  const { chainId } = useWeb3();
  const { mode } = useThemeMode();
  const theme = useMemo(() => {
    const networkPalette = {
      1: { primary: '#2962ff', secondary: '#ff4081' },
      11155111: { primary: '#512da8', secondary: '#ff6e40' },
      137: { primary: '#8247e5', secondary: '#ffb347' },
      1337: { primary: '#0277bd', secondary: '#ff4081' },
    }[chainId] || { primary: '#2962ff', secondary: '#ff29e6' };
    return buildTheme({ mode, network: networkPalette });
  }, [chainId, mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Navbar />
        <Suspense fallback={<div style={{padding:'4rem', textAlign:'center'}}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/blockchain" element={<BlockchainServices />} />
            <Route path="/book/:propertyId" element={<BookingForm />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/my-properties" element={<MyProperties />} />
            <Route path="/tickets" element={<Tickets />} />
          </Routes>
        </Suspense>
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
      <ConnectivityProvider>
        <Web3Provider>
          <ThemeModeProvider>
            <Router>
              <ThemedAppContainer />
            </Router>
          </ThemeModeProvider>
        </Web3Provider>
      </ConnectivityProvider>
    </ErrorBoundary>
  );
}

export default App;