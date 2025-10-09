import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Paper,
  Skeleton,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  LocationOn,
  AttachMoney,
  Refresh,
  Train,
  DirectionsBus,
  Movie,
  Event,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useRealTimeServices } from '../hooks/useRealTimeData';
import { useConnectivity } from '../context/ConnectivityContext';
import { SERVICE_TYPES, formatTime } from '../services/api';



const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  
  // Real-time services data
  const { 
    services, 
    loading, 
    error, 
    lastUpdated, 
    refresh
  } = useRealTimeServices();
  
  // Connectivity status
  const { backendStatus, isFullyConnected } = useConnectivity();

  // Filter services based on search and type
  useEffect(() => {
    let filtered = services;
    
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.destination.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter) {
      filtered = filtered.filter(service =>
        service.serviceType === parseInt(typeFilter)
      );
    }
    
    setFilteredServices(filtered);
  }, [searchTerm, typeFilter, services]);

  const getServiceIcon = (serviceType) => {
    const type = SERVICE_TYPES[serviceType];
    switch (serviceType) {
      case 0: return <DirectionsBus fontSize="large" sx={{ color: type?.color }} />;
      case 1: return <Train fontSize="large" sx={{ color: type?.color }} />;
      case 2: return <Movie fontSize="large" sx={{ color: type?.color }} />;
      case 3: return <Event fontSize="large" sx={{ color: type?.color }} />;
      default: return <Event fontSize="large" />;
    }
  };

  const getAvailabilityColor = (occupancyRate) => {
    if (occupancyRate < 30) return 'success';
    if (occupancyRate < 70) return 'warning';
    return 'error';
  };

  const getAvailabilityText = (occupancyRate) => {
    if (occupancyRate < 30) return 'Available';
    if (occupancyRate < 70) return 'Limited';
    return 'Nearly Full';
  };

  const ServiceCard = ({ service }) => {
    const serviceType = SERVICE_TYPES[service.serviceType] || { name: 'Unknown', color: '#666' };
    const occupancyRate = ((service.totalSeats - (service.availableSeats?.length || service.totalSeats)) / service.totalSeats) * 100;

    return (
      <Card 
        className="hover-card"
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          border: '2px solid transparent',
          '&:hover': {
            borderColor: 'primary.main',
            transform: 'translateY(-4px)',
            boxShadow: 4,
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Service Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getServiceIcon(service.serviceType)}
            <Box sx={{ ml: 2, flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {service.name}
              </Typography>
              <Chip 
                label={serviceType.name} 
                size="small" 
                sx={{ 
                  backgroundColor: serviceType.color, 
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            </Box>
          </Box>

          {/* Route Information */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              {service.origin} → {service.destination}
            </Typography>
          </Box>

          {/* Timing */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Departure:</strong> {formatTime(service.startTime)}
            </Typography>
          </Box>

          {/* Availability Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip
              label={getAvailabilityText(occupancyRate)}
              size="small"
              color={getAvailabilityColor(occupancyRate)}
              variant="outlined"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {service.totalSeats - (service.availableSeats?.length || service.totalSeats)} / {service.totalSeats} seats
            </Typography>
          </Box>

          {/* Pricing and Action */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoney color="primary" />
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                {service.basePriceEth} ETH
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              component={Link}
              to={`/book/${service.id}`}
              disabled={occupancyRate >= 100}
              sx={{ borderRadius: '20px' }}
            >
              {occupancyRate >= 100 ? 'Sold Out' : 'Book Now'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const ServiceSkeleton = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ ml: 2, flexGrow: 1 }}>
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 0.5 }} />
            <Skeleton variant="rounded" width={80} height={24} />
          </Box>
        </Box>
        <Skeleton variant="text" width="70%" sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="text" width="40%" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="rounded" width={100} height={36} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
        Available Services
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Book transportation, events, and experiences on the blockchain
      </Typography>

      {/* Connection Status */}
      {!isFullyConnected && (
        <Alert 
          severity={backendStatus === 'checking' ? 'info' : 'warning'} 
          sx={{ mb: 3 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={refresh}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : <Refresh />}
            </IconButton>
          }
        >
          {backendStatus === 'checking' 
            ? 'Checking backend connection...' 
            : 'Backend service unavailable - showing cached data'
          }
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search services by name, origin, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '25px',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Service Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              SelectProps={{ native: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '25px',
                }
              }}
            >
              <option value="">All Types</option>
              <option value="0">🚌 Bus</option>
              <option value="1">🚆 Train</option>
              <option value="2">🎬 Movie</option>
              <option value="3">🎉 Event</option>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count and Last Updated */}
      {!loading && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {filteredServices.length} services found
          </Typography>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error} - Please check your connection and try again.
        </Alert>
      )}

      {/* Services Grid */}
      <Grid container spacing={3}>
        {loading
          ? Array(6).fill(0).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ServiceSkeleton />
              </Grid>
            ))
          : filteredServices.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <ServiceCard service={service} />
              </Grid>
            ))
        }
      </Grid>

      {/* No Results */}
      {!loading && filteredServices.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No services found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search criteria or check back later
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Properties;