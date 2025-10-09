import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Paper,
  Rating,
  Skeleton,
} from '@mui/material';
import {
  Search,
  LocationOn,
  AttachMoney,
  Wifi,
  LocalParking,
  Pool,
  Restaurant,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Mock data for properties
const mockProperties = [
  {
    id: 1,
    name: 'Luxury Beachfront Villa',
    location: 'Malibu, California',
    price: 0.05, // ETH per night
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80',
    amenities: ['wifi', 'parking', 'pool'],
    description: 'Stunning oceanfront property with private beach access and panoramic views.'
  },
  {
    id: 2,
    name: 'Modern City Loft',
    location: 'Downtown Miami, Florida',
    price: 0.03,
    rating: 4.6,
    reviews: 18,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=80',
    amenities: ['wifi', 'restaurant'],
    description: 'Contemporary loft in the heart of the city with skyline views.'
  },
  {
    id: 3,
    name: 'Cozy Mountain Cabin',
    location: 'Aspen, Colorado',
    price: 0.025,
    rating: 4.9,
    reviews: 31,
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=500&q=80',
    amenities: ['wifi', 'parking'],
    description: 'Rustic cabin surrounded by nature, perfect for a peaceful getaway.'
  },
  {
    id: 4,
    name: 'Penthouse Suite',
    location: 'Manhattan, New York',
    price: 0.08,
    rating: 4.7,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=500&q=80',
    amenities: ['wifi', 'restaurant', 'pool'],
    description: 'Luxury penthouse with breathtaking city views and premium amenities.'
  },
  {
    id: 5,
    name: 'Desert Oasis Resort',
    location: 'Scottsdale, Arizona',
    price: 0.04,
    rating: 4.5,
    reviews: 19,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=500&q=80',
    amenities: ['wifi', 'pool', 'restaurant'],
    description: 'Resort-style property with spa services and desert landscape views.'
  },
  {
    id: 6,
    name: 'Historic Boutique Hotel',
    location: 'Savannah, Georgia',
    price: 0.035,
    rating: 4.4,
    reviews: 27,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=500&q=80',
    amenities: ['wifi', 'restaurant'],
    description: 'Charming historic property in the heart of the historic district.'
  }
];

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProperties, setFilteredProperties] = useState([]);

  // Simulate loading properties
  useEffect(() => {
    const timer = setTimeout(() => {
      setProperties(mockProperties);
      setFilteredProperties(mockProperties);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Filter properties based on search
  useEffect(() => {
    const filtered = properties.filter(property =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProperties(filtered);
  }, [searchTerm, properties]);

  const getAmenityIcon = (amenity) => {
    switch (amenity) {
      case 'wifi': return <Wifi fontSize="small" />;
      case 'parking': return <LocalParking fontSize="small" />;
      case 'pool': return <Pool fontSize="small" />;
      case 'restaurant': return <Restaurant fontSize="small" />;
      default: return null;
    }
  };

  const PropertyCard = ({ property }) => (
    <Card 
      className="hover-card"
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={property.image}
        alt={property.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {property.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {property.location}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating value={property.rating} precision={0.1} size="small" readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {property.rating} ({property.reviews} reviews)
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {property.description}
        </Typography>

        {/* Amenities */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {property.amenities.map((amenity, index) => (
            <Chip
              key={index}
              icon={getAmenityIcon(amenity)}
              label={amenity}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>

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
          
          <Button
            variant="contained"
            component={Link}
            to={`/book/${property.id}`}
            sx={{ borderRadius: '20px' }}
          >
            Book Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const PropertySkeleton = () => (
    <Card sx={{ height: '100%' }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
        <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rounded" width={80} height={36} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
        Discover Properties
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Find the perfect place for your next stay
      </Typography>

      {/* Search Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search properties by name, location, or description..."
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
      </Paper>

      {/* Results Count */}
      {!loading && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {filteredProperties.length} properties found
        </Typography>
      )}

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {loading
          ? Array(6).fill(0).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <PropertySkeleton />
              </Grid>
            ))
          : filteredProperties.map((property) => (
              <Grid item xs={12} sm={6} md={4} key={property.id}>
                <PropertyCard property={property} />
              </Grid>
            ))
        }
      </Grid>

      {/* No Results */}
      {!loading && filteredProperties.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No properties found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Properties;