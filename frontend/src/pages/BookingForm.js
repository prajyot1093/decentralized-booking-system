import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Rating,
} from '@mui/material';
import {
  CalendarToday,
  Person,
  AttachMoney,
  LocationOn,
  Star,
  CheckCircle,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

// Mock property data - in real app, this would come from blockchain/API
const getPropertyById = (id) => {
  const properties = {
    1: {
      id: 1,
      name: 'Luxury Beachfront Villa',
      location: 'Malibu, California',
      price: 0.05,
      rating: 4.8,
      reviews: 24,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      amenities: ['WiFi', 'Parking', 'Pool', 'Beach Access'],
      description: 'Stunning oceanfront property with private beach access and panoramic views. Perfect for a luxury getaway with all modern amenities.',
      owner: '0x1234...5678'
    },
    2: {
      id: 2,
      name: 'Modern City Loft',
      location: 'Downtown Miami, Florida',
      price: 0.03,
      rating: 4.6,
      reviews: 18,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      amenities: ['WiFi', 'Gym', 'Rooftop'],
      description: 'Contemporary loft in the heart of the city with skyline views.',
      owner: '0x2345...6789'
    }
  };
  return properties[id] || properties[1];
};

const BookingForm = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { isConnected, account, connectWallet } = useWeb3();
  
  const [property, setProperty] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Form, 2: Confirmation, 3: Processing, 4: Success

  useEffect(() => {
    // Load property data
    const propertyData = getPropertyById(propertyId);
    setProperty(propertyData);
  }, [propertyId]);

  // Calculate total nights and cost
  const calculateBooking = () => {
    if (!checkIn || !checkOut || !property) return { nights: 0, total: 0 };
    
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (nights <= 0) return { nights: 0, total: 0 };
    
    const total = nights * property.price;
    return { nights, total };
  };

  const { nights, total } = calculateBooking();

  const handleBooking = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (nights <= 0) {
      toast.error('Invalid date selection');
      return;
    }

    setBookingStep(2); // Move to confirmation
  };

  const confirmBooking = async () => {
    setLoading(true);
    setBookingStep(3); // Processing

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In real implementation, this would interact with the smart contract:
      // const contract = new ethers.Contract(contractAddress, abi, signer);
      // const tx = await contract.createBooking(propertyId, checkInTimestamp, checkOutTimestamp, { value: totalInWei });
      // await tx.wait();
      
      setBookingStep(4); // Success
      toast.success('Booking confirmed successfully!');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Booking failed. Please try again.');
      setBookingStep(2); // Back to confirmation
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setBookingStep(1);
    setCheckIn('');
    setCheckOut('');
    setGuests(1);
  };

  if (!property) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Success Step
  if (bookingStep === 4) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            Booking Confirmed!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Your reservation for {property.name} has been successfully processed.
          </Typography>
          
          <Box sx={{ textAlign: 'left', mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom><strong>Booking Details:</strong></Typography>
            <Typography>Property: {property.name}</Typography>
            <Typography>Check-in: {new Date(checkIn).toLocaleDateString()}</Typography>
            <Typography>Check-out: {new Date(checkOut).toLocaleDateString()}</Typography>
            <Typography>Guests: {guests}</Typography>
            <Typography>Total: {total} ETH</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/my-bookings')}
              sx={{ borderRadius: '20px' }}
            >
              View My Bookings
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/properties')}
              sx={{ borderRadius: '20px' }}
            >
              Book Another Property
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Property Info */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardMedia
              component="img"
              height="300"
              image={property.image}
              alt={property.name}
            />
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {property.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn color="action" fontSize="small" />
                <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                  {property.location}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={property.rating} precision={0.1} size="small" readOnly />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {property.rating} ({property.reviews} reviews)
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {property.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {property.amenities.map((amenity, index) => (
                  <Chip key={index} label={amenity} size="small" />
                ))}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney color="primary" />
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  {property.price} ETH
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                  per night
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {bookingStep === 1 && (
              <>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Book Your Stay
                </Typography>

                {!isConnected && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography>Please connect your wallet to make a booking</Typography>
                    <Button 
                      variant="contained" 
                      onClick={connectWallet}
                      sx={{ mt: 1, borderRadius: '20px' }}
                    >
                      Connect Wallet
                    </Button>
                  </Alert>
                )}

                <Box component="form" sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Check-in"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: new Date().toISOString().split('T')[0] }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Check-out"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: checkIn || new Date().toISOString().split('T')[0] }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Number of Guests"
                        type="number"
                        value={guests}
                        onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                        inputProps={{ min: 1, max: 10 }}
                      />
                    </Grid>
                  </Grid>

                  {nights > 0 && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom>Booking Summary</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Nights:</Typography>
                        <Typography>{nights}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Rate per night:</Typography>
                        <Typography>{property.price} ETH</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Total:</Typography>
                        <Typography variant="h6" color="primary">{total} ETH</Typography>
                      </Box>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleBooking}
                    disabled={!isConnected || nights <= 0}
                    sx={{ mt: 3, borderRadius: '25px', py: 1.5 }}
                  >
                    {!isConnected ? 'Connect Wallet First' : `Book for ${total} ETH`}
                  </Button>
                </Box>
              </>
            )}

            {bookingStep === 2 && (
              <>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Confirm Booking
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Please review your booking details before confirming the transaction.
                </Typography>

                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom><strong>Booking Details:</strong></Typography>
                  <Typography>Property: {property.name}</Typography>
                  <Typography>Check-in: {new Date(checkIn).toLocaleDateString()}</Typography>
                  <Typography>Check-out: {new Date(checkOut).toLocaleDateString()}</Typography>
                  <Typography>Guests: {guests}</Typography>
                  <Typography>Nights: {nights}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" color="primary">Total: {total} ETH</Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setBookingStep(1)}
                    sx={{ borderRadius: '20px', flex: 1 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={confirmBooking}
                    disabled={loading}
                    sx={{ borderRadius: '20px', flex: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Confirm & Pay'}
                  </Button>
                </Box>
              </>
            )}

            {bookingStep === 3 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Processing Your Booking...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please wait while we process your blockchain transaction.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookingForm;