import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
  Paper,
  Fab,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Visibility,
  VisibilityOff,
  Delete,
  LocationOn,
  AttachMoney,
  Star,
  BookOnline,
} from '@mui/icons-material';
// ...existing code...
import { useWeb3 } from '../context/Web3Context';

// Mock properties data
const mockProperties = [
  {
    id: 1,
    name: 'Luxury Beachfront Villa',
    location: 'Malibu, California',
    price: 0.05,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80',
    description: 'Stunning oceanfront property with private beach access.',
    isActive: true,
    totalBookings: 24,
    totalEarnings: 1.2,
    rating: 4.8,
    amenities: ['WiFi', 'Pool', 'Beach Access', 'Parking']
  },
  {
    id: 2,
    name: 'Downtown Penthouse',
    location: 'New York, NY',
    price: 0.08,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80',
    description: 'Modern penthouse with city skyline views.',
    isActive: false,
    totalBookings: 18,
    totalEarnings: 1.44,
    rating: 4.6,
    amenities: ['WiFi', 'Gym', 'Rooftop', 'Concierge']
  }
];

const MyProperties = () => {
  const { isConnected, account, connectWallet } = useWeb3();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    location: '',
    price: '',
    description: '',
    amenities: ''
  });

  useEffect(() => {
    if (isConnected) {
      // Simulate loading properties
      setTimeout(() => {
        setProperties(mockProperties);
        setLoading(false);
      }, 1000);
    }
  }, [isConnected]);

  const handleMenuClick = (event, property) => {
    setAnchorEl(event.currentTarget);
    setSelectedProperty(property);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProperty(null);
  };

  const handleToggleActive = () => {
    setProperties(properties.map(p => 
      p.id === selectedProperty.id 
        ? { ...p, isActive: !p.isActive }
        : p
    ));
    handleMenuClose();
  };

  const handleAddProperty = () => {
    if (!newProperty.name || !newProperty.location || !newProperty.price) {
      return;
    }

    const property = {
      id: Date.now(),
      name: newProperty.name,
      location: newProperty.location,
      price: parseFloat(newProperty.price),
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80',
      description: newProperty.description,
      isActive: true,
      totalBookings: 0,
      totalEarnings: 0,
      rating: 0,
      amenities: newProperty.amenities.split(',').map(a => a.trim()).filter(a => a)
    };

    setProperties([...properties, property]);
    setNewProperty({ name: '', location: '', price: '', description: '', amenities: '' });
    setAddPropertyOpen(false);
  };

  const PropertyCard = ({ property }) => (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        opacity: property.isActive ? 1 : 0.7,
        transition: 'all 0.3s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={property.image}
          alt={property.name}
        />
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton
            onClick={(e) => handleMenuClick(e, property)}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.9)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' } 
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>
        <Chip
          label={property.isActive ? 'Active' : 'Inactive'}
          color={property.isActive ? 'success' : 'default'}
          size="small"
          sx={{ position: 'absolute', top: 8, left: 8 }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {property.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {property.location}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {property.description}
        </Typography>

        {/* Amenities */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <Chip key={index} label={amenity} size="small" variant="outlined" />
          ))}
          {property.amenities.length > 3 && (
            <Chip label={`+${property.amenities.length - 3}`} size="small" variant="outlined" />
          )}
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                {property.totalBookings}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Bookings
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                {property.totalEarnings}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ETH Earned
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star fontSize="small" color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 0.5 }}>
                  {property.rating || 'N/A'}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Rating
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoney color="primary" />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              {property.price} ETH
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              /night
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (!isConnected) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <BookOnline sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Connect Your Wallet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please connect your wallet to manage your properties
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={connectWallet}
          sx={{ borderRadius: '25px', px: 4 }}
        >
          Connect Wallet
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            My Properties
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your listed properties and track performance
          </Typography>
        </Box>
        {account && (
          <Typography variant="caption" color="text.secondary">Account: {account.slice(0,6)}...{account.slice(-4)}</Typography>
        )}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddPropertyOpen(true)}
          sx={{ borderRadius: '25px', px: 3 }}
        >
          Add Property
        </Button>
      </Box>

      {/* Summary Stats */}
      {properties.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Portfolio Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {properties.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Properties
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {properties.filter(p => p.isActive).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {properties.reduce((sum, p) => sum + p.totalBookings, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Bookings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {properties.reduce((sum, p) => sum + p.totalEarnings, 0).toFixed(2)} ETH
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Earnings
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Properties Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading your properties...</Typography>
        </Box>
      ) : properties.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            No properties listed yet
          </Typography>
          <Typography>
            Start earning by listing your first property on the blockchain!
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => setAddPropertyOpen(true)}
            sx={{ mt: 2, borderRadius: '20px' }}
          >
            List Your First Property
          </Button>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add property"
        onClick={() => setAddPropertyOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <Add />
      </Fab>

      {/* Property Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Edit Property
        </MenuItem>
        <MenuItem onClick={handleToggleActive}>
          {selectedProperty?.isActive ? <VisibilityOff sx={{ mr: 1 }} /> : <Visibility sx={{ mr: 1 }} />}
          {selectedProperty?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Property
        </MenuItem>
      </Menu>

      {/* Add Property Dialog */}
      <Dialog open={addPropertyOpen} onClose={() => setAddPropertyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Property</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Property Name"
            value={newProperty.name}
            onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={newProperty.location}
            onChange={(e) => setNewProperty({ ...newProperty, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Price per Night (ETH)"
            type="number"
            value={newProperty.price}
            onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
            margin="normal"
            inputProps={{ step: 0.001, min: 0 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newProperty.description}
            onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Amenities (comma separated)"
            value={newProperty.amenities}
            onChange={(e) => setNewProperty({ ...newProperty, amenities: e.target.value })}
            margin="normal"
            placeholder="WiFi, Pool, Parking, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPropertyOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddProperty} 
            variant="contained"
            disabled={!newProperty.name || !newProperty.location || !newProperty.price}
          >
            Add Property
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyProperties;