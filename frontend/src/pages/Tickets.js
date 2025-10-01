import React from 'react';
import { Box, Container, Typography, Tabs, Tab, Grid, Card, CardContent, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Chip, Stack, IconButton, InputAdornment, Tooltip, Divider } from '@mui/material';
import SeatMap from '../components/SeatMap';
import ServiceSkeleton from '../components/ServiceSkeleton';
import { Search, Refresh, FilterAltOff, Schedule } from '@mui/icons-material';
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

// Seat map schemas per service type (basic illustrative defaults)
const seatSchemas = {
  bus: { mode: 'bus', rows: 10, seatsPerRow: 4, aisleAfter: [2] },
  train: { mode: 'train', rows: 12, seatsPerRow: 6, aisleAfter: [3] },
  movie: { mode: 'cinema', rows: 12, seatsPerRow: 10, aisleAfter: [5] }
};

function Tickets() {
  const { ticketContract, isConnected, trackTx } = useWeb3();
  const [type, setType] = React.useState('bus');
  const [search, setSearch] = React.useState({ from: '', to: '', date: '', movie: '', city: '' });
  const [onchainServices, setOnchainServices] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [listOpen, setListOpen] = React.useState(false);
  const [newService, setNewService] = React.useState({ serviceType: 'bus', name: '', origin: '', destination: '', startTime: '', price: '', seats: 40 });
  const [seatDialog, setSeatDialog] = React.useState(null); // service object
  const [selectedSeats, setSelectedSeats] = React.useState([]);
  const [sort, setSort] = React.useState('time');
  const [query, setQuery] = React.useState('');
  const [showDemoNotice, setShowDemoNotice] = React.useState(true);

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

  // Optimized parallel load (reduces sequential RPC latency) with graceful fallback
  React.useEffect(() => {
    if (!ticketContract) return;
    let ignore = false;
    const MAX_IDS = 30; // allow more services
    setLoading(true); setError(null);
    (async () => {
      try {
        const calls = Array.from({ length: MAX_IDS }, (_, i) => i + 1).map(async (id) => {
          try {
            const svc = await ticketContract.getService(id);
            if (svc.id && svc.id.toString() !== '0') {
              return {
                id: Number(svc.id),
                type: ['bus','train','movie'][Number(svc.serviceType)] || 'bus',
                name: svc.name,
                origin: svc.origin,
                destination: svc.destination,
                startTime: Number(svc.startTime),
                seats: Number(svc.totalSeats),
                priceWei: svc.basePriceWei,
                isActive: svc.isActive,
              };
            }
          } catch { /* ignore individual service errors */ }
          return null;
        });
        const results = (await Promise.all(calls)).filter(Boolean);
        if (!ignore) setOnchainServices(results);
      } catch (err) {
        console.error('Load services failed', err);
        if (!ignore) setError('Failed to load services');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [ticketContract]);

  const refresh = () => {
    if (ticketContract) {
      setLoading(true); setError(null); setOnchainServices([]);
      // trigger effect by resetting contract reference logic implicitly; call load inline
      (async () => {
        const services = [];
        for (let i = 1; i <= 30; i++) {
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
        setLoading(false);
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
  const displayResults = React.useMemo(() => {
    const base = (isConnected && onchainServices.length) ? onchainServices : sampleResults;
    let subset = base.filter(r => r.type === type);
    if (query) {
      const q = query.toLowerCase();
      subset = subset.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.origin.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q)
      );
    }
    if (sort === 'seats') subset = subset.slice().sort((a,b) => b.seats - a.seats);
    if (sort === 'time') subset = subset.slice().sort((a,b) => (a.startTime||0) - (b.startTime||0));
    return subset;
  }, [isConnected, onchainServices, type, query, sort]);

  const formatPrice = (r) => {
    if (r.priceWei) {
      try { return `${Number(r.priceWei) / 1e18} ETH`; } catch { return '—'; }
    }
    return r.price || '—';
  };

  return (
    <Box sx={{ py: 4, color: 'text.primary' }} className="tickets-section">
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary', textShadow: '0 0 6px rgba(0,229,255,0.25)' }}>
          Decentralized Ticket Booking
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.05rem' }}>
          Book bus, train and movie tickets directly on-chain.
        </Typography>

        <Tabs value={type} onChange={handleChange} sx={{ mb: 2 }}>
          {ticketTypes.map(t => <Tab key={t.key} label={t.label} value={t.key} />)}
        </Tabs>

        {/* Filter & Search Toolbar */}
        <Box sx={{ display:'flex', flexDirection:'column', gap:2, mt:1 }}>
          <Stack direction={{ xs:'column', md:'row' }} spacing={2} alignItems={{ xs:'stretch', md:'center' }}>
            <TextField
              placeholder="Search name / origin / destination"
              value={query}
              onChange={e => setQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
              fullWidth
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="Sort: Time" color={sort==='time'?'primary':'default'} size="small" onClick={() => setSort('time')} clickable />
              <Chip label="Sort: Seats" color={sort==='seats'?'primary':'default'} size="small" onClick={() => setSort('seats')} clickable />
              {query && <Chip label="Clear" onClick={() => setQuery('')} size="small" icon={<FilterAltOff />} />}
            </Stack>
            <Tooltip title="Refresh" arrow>
              <span>
                <IconButton disabled={!ticketContract || loading} onClick={refresh} color="primary"><Refresh /></IconButton>
              </span>
            </Tooltip>
          </Stack>
          {renderSearch()}
        </Box>

        {error && <Typography color="error" variant="body2" sx={{ mt:1 }}>{error}</Typography>}
        {showDemoNotice && !isConnected && (
          <Box sx={{ mt:2, p:1.5, border:'1px solid rgba(255,255,255,0.12)', borderRadius:2, fontSize:'.85rem', background:'rgba(255,255,255,0.04)' }}>
            Showing demo data. Connect wallet to load on-chain services. <Button size="small" onClick={() => setShowDemoNotice(false)} sx={{ ml:1 }}>Dismiss</Button>
          </Box>
        )}

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {loading && Array.from({ length: 6 }).map((_,i) => (
            <Grid item xs={12} md={4} key={`sk-${i}`}><ServiceSkeleton /></Grid>
          ))}
          {!loading && displayResults.map(result => (
            <Grid item xs={12} md={4} key={result.id+result.name}>
              <Card className="hover-card" sx={{ position:'relative', transition: '0.3s', color: 'text.primary', backdropFilter: 'blur(10px)', background: 'linear-gradient(155deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', pr:1 }}>{result.name}</Typography>
                    {result.isActive === false && <Chip label="INACTIVE" size="small" color="warning" />}
                  </Stack>
                  {type === 'movie' ? (
                    <Typography variant="body2" color="text.secondary">City: {result.origin}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ display:'flex', alignItems:'center', gap:.5 }}>{result.origin} → {result.destination}</Typography>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt:1, flexWrap:'wrap' }}>
                    <Chip size="small" icon={<Schedule fontSize="inherit" />} label={result.startTime ? new Date(result.startTime*1000).toLocaleString() : 'N/A'} variant="outlined" />
                    <Chip size="small" label={`${result.seats} seats`} variant="outlined" />
                    <Chip size="small" label={formatPrice(result)} color="secondary" />
                  </Stack>
                  <Button disabled={!isConnected} variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={() => { setSeatDialog(result); setSelectedSeats([]); }}>Book</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {!loading && !displayResults.length && (
            <Grid item xs={12}>
              <Box sx={{ p:4, textAlign:'center', border:'1px dashed rgba(255,255,255,0.15)', borderRadius:3 }}>
                <Typography variant="body1" sx={{ mb:1 }}>No services found.</Typography>
                <Button size="small" onClick={refresh} disabled={loading || !ticketContract}>Reload</Button>
              </Box>
            </Grid>
          )}
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
              <Divider sx={{ my:1.5, opacity:.3 }} />
              <SeatMap
                schema={seatSchemas[seatDialog.type]}
                total={seatDialog.seats}
                selected={selectedSeats}
                onChange={setSelectedSeats}
                bookedChecker={(seat) => false /* TODO integrate on-chain seat booked cache */}
                maxSelectable={10}
                ariaLabel={`Seat map for ${seatDialog.name}`}
              />
              <Box sx={{ mt:2, display:'flex', gap:2, flexWrap:'wrap', fontSize:12 }}>
                <Chip size="small" label="Available" variant="outlined" />
                <Chip size="small" label="Selected" color="primary" />
                <Chip size="small" label="Booked" color="error" variant="outlined" />
              </Box>
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
