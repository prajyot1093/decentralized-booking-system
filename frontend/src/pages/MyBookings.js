import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  
  Alert,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  BookOnline,
  CheckCircle,
  Schedule,
  Cancel,
  Star,
  LocationOn,
  CalendarToday,
  AttachMoney,
} from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';

// Mock booking data
const mockBookings = [
  {
    id: 1,
    propertyId: 1,
    propertyName: 'Luxury Beachfront Villa',
    propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&q=80',
    location: 'Malibu, California',
    checkIn: '2024-01-15',
    checkOut: '2024-01-20',
    guests: 2,
    totalAmount: 0.25,
    status: 'confirmed',
    bookingDate: '2024-01-01',
    transactionHash: '0xabc123...def456'
  },
  {
    id: 2,
    propertyId: 2,
    propertyName: 'Modern City Loft',
    propertyImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=300&q=80',
    location: 'Downtown Miami, Florida',
    checkIn: '2024-02-10',
    checkOut: '2024-02-14',
    guests: 1,
    totalAmount: 0.12,
    status: 'pending',
    bookingDate: '2024-01-25',
    transactionHash: '0x123abc...456def'
  },
  {
    id: 3,
    propertyId: 3,
    propertyName: 'Cozy Mountain Cabin',
    propertyImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=300&q=80',
    location: 'Aspen, Colorado',
    checkIn: '2023-12-01',
    checkOut: '2023-12-05',
    guests: 4,
    totalAmount: 0.10,
    status: 'completed',
    bookingDate: '2023-11-15',
    transactionHash: '0x789ghi...012jkl',
    rating: 5,
    review: 'Amazing stay! Perfect location and very clean.'
  }
];

const MyBookings = () => {
  const { isConnected, account, connectWallet } = useWeb3();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (isConnected) {
      // Simulate loading bookings
      setTimeout(() => {
        setBookings(mockBookings);
        setLoading(false);
      }, 1000);
    }
  }, [isConnected]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'warning', icon: <Schedule />, text: 'Pending' };
      case 'confirmed':
        return { color: 'success', icon: <CheckCircle />, text: 'Confirmed' };
      case 'completed':
        return { color: 'primary', icon: <Star />, text: 'Completed' };
      case 'cancelled':
        return { color: 'error', icon: <Cancel />, text: 'Cancelled' };
      default:
        return { color: 'default', icon: <BookOnline />, text: 'Unknown' };
    }
  };

  const filterBookings = (status) => {
    switch (status) {
      case 0: return bookings; // All
      case 1: return bookings.filter(b => b.status === 'pending' || b.status === 'confirmed'); // Upcoming
      case 2: return bookings.filter(b => b.status === 'completed'); // Past
      case 3: return bookings.filter(b => b.status === 'cancelled'); // Cancelled
      default: return bookings;
    }
  };

  const BookingCard = ({ booking }) => {
    const statusInfo = getStatusInfo(booking.status);
    const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));

    return (
      <Card elevation={2} sx={{ mb: 2, transition: 'all 0.3s ease', '&:hover': { boxShadow: 4 } }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Property Image */}
            <Grid item xs={12} sm={4} md={3}>
              <Box
                component="img"
                src={booking.propertyImage}
                alt={booking.propertyName}
                sx={{
                  width: '100%',
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 2
                }}
              />
            </Grid>

            {/* Booking Details */}
            <Grid item xs={12} sm={8} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {booking.propertyName}
                </Typography>
                <Chip
                  icon={statusInfo.icon}
                  label={statusInfo.text}
                  color={statusInfo.color}
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  {booking.location}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  ({nights} {nights === 1 ? 'night' : 'nights'})
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Guests: {booking.guests} • Booked on: {new Date(booking.bookingDate).toLocaleDateString()}
              </Typography>

              {booking.review && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>Your Review:</Typography>
                    <Box sx={{ display: 'flex' }}>
                      {[...Array(booking.rating)].map((_, i) => (
                        <Star key={i} fontSize="small" color="primary" />
                      ))}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    "{booking.review}"
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Amount and Actions */}
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mb: 2 }}>
                  <AttachMoney color="primary" />
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {booking.totalAmount} ETH
                  </Typography>
                  {account && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                      Account: {account.slice(0,6)}...{account.slice(-4)}
                    </Typography>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Tx: {booking.transactionHash.slice(0, 8)}...{booking.transactionHash.slice(-6)}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {booking.status === 'confirmed' && (
                    <Button 
                      variant="outlined" 
                      size="small"
                      sx={{ borderRadius: '15px' }}
                    >
                      Check-in
                    </Button>
                  )}
                  
                  {booking.status === 'completed' && !booking.review && (
                    <Button 
                      variant="contained" 
                      size="small"
                      sx={{ borderRadius: '15px' }}
                    >
                      Write Review
                    </Button>
                  )}

                  {booking.status === 'pending' && (
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small"
                      sx={{ borderRadius: '15px' }}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (!isConnected) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <BookOnline sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Connect Your Wallet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please connect your wallet to view your bookings
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

  const filteredBookings = filterBookings(tabValue);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
        My Bookings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage and track all your property bookings
      </Typography>

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label={`All (${bookings.length})`} />
          <Tab label={`Upcoming (${bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length})`} />
          <Tab label={`Past (${bookings.filter(b => b.status === 'completed').length})`} />
          <Tab label={`Cancelled (${bookings.filter(b => b.status === 'cancelled').length})`} />
        </Tabs>
      </Paper>

      {/* Bookings List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading your bookings...</Typography>
        </Box>
      ) : filteredBookings.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            No bookings found
          </Typography>
          <Typography>
            {tabValue === 0 
              ? "You haven't made any bookings yet. Start exploring properties to make your first booking!"
              : "No bookings in this category."
            }
          </Typography>
        </Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
          </Typography>
          
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </>
      )}

      {/* Summary Stats */}
      {bookings.length > 0 && (
        <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Booking Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {bookings.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Bookings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {bookings.filter(b => b.status === 'completed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upcoming
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {bookings.reduce((sum, b) => sum + b.totalAmount, 0).toFixed(3)} ETH
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Spent
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default MyBookings;