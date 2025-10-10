import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Event as EventIcon
} from '@mui/icons-material';

// Mock data for development - simplified and stable
const MOCK_SERVICES = [
  {
    id: 1,
    name: 'Movie Theater - Avengers',
    description: 'Premium movie experience',
    pricePerSeat: 12.50,
    totalSeats: 100,
    availableSeats: 75,
    type: 'entertainment',
    status: 'active'
  },
  {
    id: 2,
    name: 'Flight NYC-LA',
    description: 'Direct flight service',
    pricePerSeat: 299.00,
    totalSeats: 180,
    availableSeats: 45,
    type: 'transportation',
    status: 'active'
  },
  {
    id: 3,
    name: 'Concert - Rock Band',
    description: 'Live music concert',
    pricePerSeat: 85.00,
    totalSeats: 500,
    availableSeats: 120,
    type: 'entertainment',
    status: 'active'
  }
];

const BlockchainServices = () => {
  const [services, setServices] = useState(MOCK_SERVICES);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setServices([...MOCK_SERVICES]);
    }, 1000);
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'entertainment': return 'primary';
      case 'transportation': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Booking Services
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Status */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Running in demo mode with mock data. All bookings are simulated.
      </Alert>

      {/* Services Grid */}
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
                border: selectedService?.id === service.id ? 2 : 0,
                borderColor: 'primary.main'
              }}
              onClick={() => handleServiceClick(service)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <EventIcon color="primary" />
                  <Typography variant="h6" component="h3" noWrap>
                    {service.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {service.description}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip 
                    label={service.type} 
                    color={getTypeColor(service.type)}
                    size="small"
                  />
                  <Typography variant="h6" color="primary">
                    ${service.pricePerSeat}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Available: {service.availableSeats}/{service.totalSeats}
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small"
                    disabled={service.availableSeats === 0}
                  >
                    Book Now
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Selected Service Details */}
      {selectedService && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" mb={2}>
            {selectedService.name} - Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Description:</strong> {selectedService.description}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Price per seat:</strong> ${selectedService.pricePerSeat}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Total seats:</strong> {selectedService.totalSeats}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Available:</strong> {selectedService.availableSeats}
              </Typography>
            </Grid>
          </Grid>
          <Box mt={2}>
            <Button variant="contained" color="primary" size="large">
              Proceed to Seat Selection
            </Button>
            <Button 
              variant="outlined" 
              sx={{ ml: 2 }}
              onClick={() => setSelectedService(null)}
            >
              Close Details
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default BlockchainServices;