import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  AccountBalanceWallet as WalletIcon,
  NetworkWifi as NetworkIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';
import { useBlockchainServices, useBlockchainBooking } from '../hooks/useBlockchainData';
import { SeatMap } from './SeatMap';

const BlockchainServices = () => {
  const {
    isConnected,
    account,
    isNetworkSupported,
    networkConfig,
    connectWallet,
    switchNetwork,
    contractEvents,
    createService
  } = useWeb3();

  const { services, loading, error, refetch, isBlockchain } = useBlockchainServices();
  const { bookSeat, isBooking, isBlockchainMode } = useBlockchainBooking();

  const [selectedService, setSelectedService] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    pricePerSeat: '',
    totalSeats: ''
  });

  // Handle service creation
  const handleCreateService = async () => {
    try {
      await createService(
        newService.name,
        newService.description,
        parseFloat(newService.pricePerSeat),
        parseInt(newService.totalSeats)
      );
      
      setShowCreateDialog(false);
      setNewService({ name: '', description: '', pricePerSeat: '', totalSeats: '' });
      
      // Refresh services after creation
      setTimeout(() => refetch(), 2000);
    } catch (error) {
      console.error('Error creating service:', error);
    }
  };

  // Network status indicator
  const NetworkStatus = () => (
    <Paper sx={{ p: 2, mb: 3, backgroundColor: 'background.paper' }}>
      <Box display="flex" alignItems="center" gap={2}>
        <NetworkIcon color={isNetworkSupported ? "success" : "error"} />
        <Box flex={1}>
          <Typography variant="h6" component="span">
            Network Status
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isConnected 
              ? `Connected to ${networkConfig?.network?.name || 'Unknown Network'}`
              : 'Not connected'
            }
          </Typography>
        </Box>
        
        {!isConnected && (
          <Button 
            variant="contained" 
            startIcon={<WalletIcon />}
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        )}
        
        {isConnected && !isNetworkSupported && (
          <Button 
            variant="outlined" 
            color="warning"
            onClick={() => switchNetwork(31337)}
          >
            Switch to Localhost
          </Button>
        )}
        
        <Tooltip title="Refresh data">
          <IconButton onClick={refetch} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Data source indicator */}
      <Box mt={2}>
        <Chip 
          label={isBlockchain ? "🔗 Blockchain Data" : "🔄 API Fallback"} 
          color={isBlockchain ? "success" : "warning"}
          variant="outlined"
          size="small"
        />
        
        {contractEvents.length > 0 && (
          <Chip 
            label={`${contractEvents.length} Real-time Events`}
            color="info"
            variant="outlined"
            size="small"
            sx={{ ml: 1 }}
          />
        )}
      </Box>
    </Paper>
  );

  // Service card component
  const ServiceCard = ({ service }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        '&:hover': { 
          transform: 'translateY(-2px)',
          boxShadow: 3
        },
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={() => setSelectedService(service)}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {service.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {service.description}
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" color="primary">
            {service.pricePerSeat} ETH
          </Typography>
          <Chip 
            label={`${service.availableSeats}/${service.totalSeats} Available`}
            color={service.availableSeats > 0 ? "success" : "error"}
            size="small"
          />
        </Box>

        <Box display="flex" gap={1}>
          {isBlockchain && service.transactionHash && (
            <Tooltip title={`Block: ${service.blockNumber}`}>
              <Chip 
                icon={<EventIcon />}
                label="On-Chain"
                color="success"
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
          
          {service.isActive !== undefined && (
            <Chip 
              label={service.isActive ? "Active" : "Inactive"}
              color={service.isActive ? "success" : "default"}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );

  // Recent events component
  const RecentEvents = () => {
    const recentEvents = contractEvents.slice(0, 5);
    
    if (recentEvents.length === 0) return null;

    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Blockchain Events
        </Typography>
        {recentEvents.map((event) => (
          <Box key={event.id} display="flex" alignItems="center" gap={2} mb={1}>
            <EventIcon color="primary" fontSize="small" />
            <Box flex={1}>
              <Typography variant="body2">
                <strong>{event.type}</strong>
                {event.type === 'ServiceCreated' && ` - ${event.name}`}
                {event.type === 'SeatBooked' && ` - Seat ${event.seatNumber} in Service ${event.serviceId}`}
                {event.type === 'SeatCancelled' && ` - Seat ${event.seatNumber} in Service ${event.serviceId}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Block: {event.blockNumber} | {new Date(event.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
        ))}
      </Paper>
    );
  };

  if (loading && services.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading blockchain services...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Network Status */}
      <NetworkStatus />

      {/* Recent Events */}
      <RecentEvents />

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading services: {error}
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Blockchain Services
        </Typography>
        
        {isBlockchainMode && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
          >
            Create Service
          </Button>
        )}
      </Box>

      {/* Services Grid */}
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <ServiceCard service={service} />
          </Grid>
        ))}
      </Grid>

      {services.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No services found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isBlockchainMode 
              ? "Create the first service on the blockchain!"
              : "Connect your wallet to interact with blockchain services."
            }
          </Typography>
        </Paper>
      )}

      {/* Service Details Dialog */}
      <Dialog 
        open={!!selectedService} 
        onClose={() => setSelectedService(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedService && (
          <>
            <DialogTitle>
              {selectedService.name}
              <Typography variant="body2" color="text.secondary">
                {selectedService.description}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Price: {selectedService.pricePerSeat} ETH per seat
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Available: {selectedService.availableSeats}/{selectedService.totalSeats} seats
                </Typography>
              </Box>

              {/* Seat Map */}
              <SeatMap 
                serviceId={selectedService.id}
                totalSeats={selectedService.totalSeats}
                onSeatSelect={(seatNumber) => {
                  if (isBlockchainMode) {
                    setShowBookingDialog(seatNumber);
                  }
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedService(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Service Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)}>
        <DialogTitle>Create New Service</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Service Name"
            fullWidth
            variant="outlined"
            value={newService.name}
            onChange={(e) => setNewService({...newService, name: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newService.description}
            onChange={(e) => setNewService({...newService, description: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Price per Seat (ETH)"
            type="number"
            fullWidth
            variant="outlined"
            value={newService.pricePerSeat}
            onChange={(e) => setNewService({...newService, pricePerSeat: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Total Seats"
            type="number"
            fullWidth
            variant="outlined"
            value={newService.totalSeats}
            onChange={(e) => setNewService({...newService, totalSeats: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateService}
            variant="contained"
            disabled={!newService.name || !newService.pricePerSeat || !newService.totalSeats}
          >
            Create Service
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlockchainServices;