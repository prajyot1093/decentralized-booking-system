import React from 'react';
import { Box, Container, Typography, Tabs, Tab, Grid, Card, CardContent, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import SeatMap from '../components/SeatMap';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';

const ticketTypes = [
  { key: 'bus', label: 'Bus' },
  { key: 'train', label: 'Train' },
  { key: 'movie', label: 'Movie' }
];

// Fallback demo data when contract not connected
const sampleResults = [
  { id: 1, type: 'bus', name: 'Express Coach', origin: 'City A', destination: 'City B', seats: 40, price: '0.01 ETH' },
  { id: 2, type: 'train', name: 'Intercity Line', origin: 'City A', destination: 'City C', seats: 80, price: '0.015 ETH' },
  { id: 3, type: 'movie', name: 'Sci-Fi Blockbuster', origin: 'Metropolis', destination: 'Grand Cinema', seats: 100, price: '0.005 ETH' }
];

function Tickets() {
  const { ticketContract, isConnected, trackTx } = useWeb3();
  const [type, setType] = React.useState('bus');
  const [search, setSearch] = React.useState({ from: '', to: '', date: '', movie: '', city: '' });
  const [onchainServices, setOnchainServices] = React.useState([]);
  const [listOpen, setListOpen] = React.useState(false);
  const [newService, setNewService] = React.useState({ serviceType: 'bus', name: '', origin: '', destination: '', startTime: '', price: '', seats: 40 });
  const [seatDialog, setSeatDialog] = React.useState(null); // service object
  const [selectedSeats, setSelectedSeats] = React.useState([]);

  const handleChange = (_, newValue) => setType(newValue);

  const renderSearch = () => {
    if (type === 'movie') {
      return (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="City" value={search.city} onChange={e => setSearch(s => ({ ...s, city: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Movie" value={search.movie} onChange={e => setSearch(s => ({ ...s, movie: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField type="date" fullWidth label="Date" InputLabelProps={{ shrink: true }} value={search.date} onChange={e => setSearch(s => ({ ...s, date: e.target.value }))} />
          </Grid>
        </Grid>
      );
    }
    return (
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="From" value={search.from} onChange={e => setSearch(s => ({ ...s, from: e.target.value }))} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth label="To" value={search.to} onChange={e => setSearch(s => ({ ...s, to: e.target.value }))} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField type="date" fullWidth label="Date" InputLabelProps={{ shrink: true }} value={search.date} onChange={e => setSearch(s => ({ ...s, date: e.target.value }))} />
        </Grid>
        <Grid item xs={12} md={3}>
          <Button fullWidth variant="contained" color="secondary" sx={{ height: '100%' }}>Search</Button>
        </Grid>
      </Grid>
    );
  };

  React.useEffect(() => {
    // Placeholder: Without an enumerable list on-chain we assume first 10 IDs
    const load = async () => {
      if (!ticketContract) return;
      const services = [];
      for (let i = 1; i <= 10; i++) {
        try {
          const svc = await ticketContract.getService(i);
          if (svc.id.toString() === '0') continue; // uninitialized
          services.push({
            id: Number(svc.id),
            type: ['bus','train','movie'][Number(svc.serviceType)] || 'bus',
            name: svc.name,
            origin: svc.origin,
            destination: svc.destination,
            startTime: Number(svc.startTime),
            seats: Number(svc.totalSeats),
            priceWei: svc.basePriceWei,
            isActive: svc.isActive,
          });
        } catch (e) {
          // stop if call fails (likely out of range)
          break;
        }
      }
      setOnchainServices(services);
    };
    load();
  }, [ticketContract]);

  const refresh = () => {
    if (ticketContract) {
      setOnchainServices([]);
      // trigger effect by resetting contract reference logic implicitly; call load inline
      (async () => {
        const services = [];
        for (let i = 1; i <= 20; i++) {
          try {
            const svc = await ticketContract.getService(i);
            if (svc.id.toString() === '0') continue;
            services.push({
              id: Number(svc.id),
              type: ['bus','train','movie'][Number(svc.serviceType)] || 'bus',
              name: svc.name,
              origin: svc.origin,
              destination: svc.destination,
              startTime: Number(svc.startTime),
              seats: Number(svc.totalSeats),
              priceWei: svc.basePriceWei,
              isActive: svc.isActive,
            });
          } catch { break; }
        }
        setOnchainServices(services);
      })();
    }
  };

  const handleListService = async () => {
    if (!ticketContract) return;
    try {
      const st = Math.floor(new Date(newService.startTime).getTime() / 1000);
      const priceWei = ethers.parseEther(newService.price || '0');
      const seatCount = Number(newService.seats || 0);
      const typeIndex = { bus:0, train:1, movie:2 }[newService.serviceType];
      await trackTx(
        ticketContract.listService(typeIndex, newService.name, newService.origin, newService.destination, st, priceWei, seatCount),
        `List ${newService.serviceType} service: ${newService.name}`
      );
      setListOpen(false);
      setNewService({ serviceType: 'bus', name: '', origin: '', destination: '', startTime: '', price: '', seats: 40 });
      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookSeats = async () => {
    if (!ticketContract || !seatDialog || !selectedSeats.length) return;
    try {
      const service = seatDialog;
      const total = (Number(service.priceWei) * selectedSeats.length).toString();
      await trackTx(
        ticketContract.purchaseSeats(service.id, selectedSeats, { value: total }),
        `Book ${selectedSeats.length} seat(s) for ${service.name}`
      );
      setSeatDialog(null);
      setSelectedSeats([]);
      refresh();
    } catch (e) { console.error(e); }
  };

  // Replace sampleResults when contract connected
  const displayResults = (isConnected && onchainServices.length > 0)
    ? onchainServices.filter(r => r.type === type)
    : sampleResults.filter(r => r.type === type);

  const formatPrice = (r) => {
    if (r.priceWei) {
      try { return `${Number(r.priceWei) / 1e18} ETH`; } catch { return '—'; }
    }
    return r.price || '—';
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          Decentralized Ticket Booking
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Book bus, train and movie tickets directly on-chain.
        </Typography>

        <Tabs value={type} onChange={handleChange} sx={{ mb: 2 }}>
          {ticketTypes.map(t => <Tab key={t.key} label={t.label} value={t.key} />)}
        </Tabs>

        {renderSearch()}

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {displayResults.map(result => (
            <Grid item xs={12} md={4} key={result.id}>
              <Card className="hover-card" sx={{ transition: '0.3s' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{result.name}</Typography>
                  {type === 'movie' ? (
                    <Typography variant="body2" color="text.secondary">City: {result.origin}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">{result.origin} → {result.destination}</Typography>
                  )}
                  <Typography variant="body2" sx={{ mt: 1 }}>Seats: {result.seats}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>Price: {formatPrice(result)}</Typography>
                  <Button disabled={!isConnected} variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={() => { setSeatDialog(result); setSelectedSeats([]); }}>Book</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt:4, display:'flex', gap:2 }}>
          <Button variant="outlined" onClick={refresh} disabled={!ticketContract}>Refresh</Button>
          <Button variant="contained" onClick={() => setListOpen(true)} disabled={!isConnected}>List {type === 'movie' ? 'Show' : 'Service'}</Button>
        </Box>
      </Container>

      {/* List Service Modal */}
      <Dialog open={listOpen} onClose={() => setListOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>List New {newService.serviceType.charAt(0).toUpperCase()+newService.serviceType.slice(1)} {newService.serviceType === 'movie' ? 'Show' : 'Service'}</DialogTitle>
        <DialogContent dividers>
          <TextField select fullWidth sx={{ mt:2 }} label="Type" value={newService.serviceType} onChange={e => setNewService(ns => ({ ...ns, serviceType: e.target.value }))}>
            {ticketTypes.map(t => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
          </TextField>
          <TextField fullWidth sx={{ mt:2 }} label="Name / Title" value={newService.name} onChange={e => setNewService(ns => ({ ...ns, name: e.target.value }))} />
          <TextField fullWidth sx={{ mt:2 }} label={newService.serviceType === 'movie' ? 'City' : 'Origin'} value={newService.origin} onChange={e => setNewService(ns => ({ ...ns, origin: e.target.value }))} />
          <TextField fullWidth sx={{ mt:2 }} label={newService.serviceType === 'movie' ? 'Theatre' : 'Destination'} value={newService.destination} onChange={e => setNewService(ns => ({ ...ns, destination: e.target.value }))} />
          <TextField type="datetime-local" fullWidth sx={{ mt:2 }} label="Start Time" InputLabelProps={{ shrink:true }} value={newService.startTime} onChange={e => setNewService(ns => ({ ...ns, startTime: e.target.value }))} />
          <TextField fullWidth sx={{ mt:2 }} label="Price (ETH)" value={newService.price} onChange={e => setNewService(ns => ({ ...ns, price: e.target.value }))} />
          <TextField fullWidth sx={{ mt:2 }} label="Total Seats" type="number" value={newService.seats} onChange={e => setNewService(ns => ({ ...ns, seats: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setListOpen(false)}>Cancel</Button>
          <Button onClick={handleListService} variant="contained" disabled={!ticketContract || !newService.name || !newService.price}>List</Button>
        </DialogActions>
      </Dialog>

      {/* Seat Selection Dialog */}
      <Dialog open={!!seatDialog} onClose={() => setSeatDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Seats</DialogTitle>
        <DialogContent dividers>
          {seatDialog && (
            <>
              <Typography variant="subtitle2">{seatDialog.name}</Typography>
              <Typography variant="caption" color="text.secondary">{seatDialog.origin} {seatDialog.type !== 'movie' && '→ ' + seatDialog.destination}</Typography>
              <SeatMap
                total={seatDialog.seats}
                selected={selectedSeats}
                onChange={setSelectedSeats}
                bookedChecker={(seat) => false /* TODO: integrate isSeatBooked call cache */}
              />
              <Typography variant="body2" sx={{ mt:2 }}>Selected: {selectedSeats.join(', ') || 'None'}</Typography>
              <Typography variant="body2">Total: {seatDialog.priceWei ? (Number(seatDialog.priceWei) / 1e18 * selectedSeats.length).toFixed(4) : 0} ETH</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeatDialog(null)}>Close</Button>
          <Button variant="contained" onClick={handleBookSeats} disabled={!selectedSeats.length}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Tickets;
