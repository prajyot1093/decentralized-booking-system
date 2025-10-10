import React, { useState, useMemo, useEffect } from 'react';
import { Box, Button, Typography, Chip, Paper, Alert, Skeleton } from '@mui/material';
import { useServiceSeats } from '../hooks/useServices';

/**
 * Enhanced SeatMap Component with API integration and optimistic UI
 */
export default function SeatMap({
  serviceId,
  totalSeats = 40,
  selected = [],
  onChange = () => {},
  maxSelectable = 5,
  disabled = false,
  dense = false,
  ariaLabel = 'Seat selection grid',
  onBookingStart = () => {},
  onBookingComplete = () => {},
  onBookingError = () => {}
}) {
  const [selectedSeats, setSelectedSeats] = useState(selected);
  const [optimisticBookings, setOptimisticBookings] = useState([]); // Seats being processed
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Fetch seat data from API
  const { seatData, loading: seatsLoading, error: seatsError, refreshSeats } = useServiceSeats(serviceId);

  // Calculate grid layout
  const rows = Math.ceil(totalSeats / 8);
  const seatsPerRow = 8;

  // Convert API seat format (A-1, B-2) to numbers for compatibility
  const convertSeatIdToNumber = (seatId) => {
    if (typeof seatId === 'number') return seatId;
    if (typeof seatId !== 'string') return null;
    
    const match = seatId.match(/([A-Z])-(\d+)/);
    if (!match) return null;
    
    const row = match[1].charCodeAt(0) - 65; // A=0, B=1, etc.
    const seat = parseInt(match[2]) - 1; // 1-based to 0-based
    return row * 10 + seat + 1; // Convert to linear seat number
  };

  // Get booked seats from API or fallback to mock data
  const bookedSeats = useMemo(() => {
    if (seatData && seatData.bookedSeats) {
      return seatData.bookedSeats
        .map(convertSeatIdToNumber)
        .filter(num => num !== null);
    }
    // Fallback mock data
    return [1, 5, 12, 18, 25, 33];
  }, [seatData]);

  // Handle optimistic booking
  const startOptimisticBooking = async (seats) => {
    try {
      setBookingInProgress(true);
      setOptimisticBookings(seats);
      
      // Callback to parent component to start transaction
      onBookingStart(seats);
      
      // Simulate transaction processing (replace with actual Web3 call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // On success - refresh seat data to get latest state
      await refreshSeats();
      setOptimisticBookings([]);
      setSelectedSeats([]);
      onBookingComplete(seats);
      
    } catch (error) {
      // On error - rollback optimistic UI
      setOptimisticBookings([]);
      onBookingError(error, seats);
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleSeatClick = (seatNumber) => {
    if (disabled || bookedSeats.includes(seatNumber) || optimisticBookings.includes(seatNumber)) {
      return;
    }

    const newSelected = [...selectedSeats];
    const seatIndex = newSelected.indexOf(seatNumber);

    if (seatIndex > -1) {
      // Deselect seat
      newSelected.splice(seatIndex, 1);
    } else {
      // Select seat (if under limit)
      if (maxSelectable && newSelected.length >= maxSelectable) {
        return; // Max seats reached
      }
      newSelected.push(seatNumber);
    }

    setSelectedSeats(newSelected);
    onChange(newSelected);
  };

  const getSeatStatus = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return 'booked';
    if (optimisticBookings.includes(seatNumber)) return 'processing';
    if (selectedSeats.includes(seatNumber)) return 'selected';
    return 'available';
  };

  // Update parent when selected seats change
  useEffect(() => {
    onChange(selectedSeats);
  }, [selectedSeats, onChange]);

  const getSeatColor = (status) => {
    switch (status) {
      case 'booked': return '#f44336';
      case 'selected': return '#2196f3';
      case 'processing': return '#ff9800';
      case 'available': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getSeatLabel = (status) => {
    switch (status) {
      case 'booked': return 'Booked';
      case 'selected': return 'Selected';
      case 'processing': return 'Processing...';
      case 'available': return 'Available';
      default: return 'Unknown';
    }
  };

  const seats = useMemo(() => {
    const seatList = [];
    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = row * seatsPerRow + col + 1;
        if (seatNumber <= totalSeats) {
          rowSeats.push(seatNumber);
        }
      }
      seatList.push(rowSeats);
    }
    return seatList;
  }, [rows, seatsPerRow, totalSeats]);

  // Show loading state while fetching seat data
  if (seatsLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" mb={2}>Loading seat availability...</Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={40} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* API Error Alert */}
      {seatsError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Unable to load real-time seat data. Showing cached information.
        </Alert>
      )}

      {/* Booking Progress Alert */}
      {bookingInProgress && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Processing your booking... Please wait.
        </Alert>
      )}

      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" mb={1}>
          Select Your Seats
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {seatData ? (
            `${seatData.availableSeats} of ${seatData.totalSeats} seats available`
          ) : (
            `Select up to ${maxSelectable} seats`
          )}
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip 
            size="small"
            sx={{ backgroundColor: getSeatColor('available') }}
            label="Available"
          />
          <Chip 
            size="small"
            sx={{ backgroundColor: getSeatColor('selected') }}
            label="Selected"
          />
          <Chip 
            size="small"
            sx={{ backgroundColor: getSeatColor('processing') }}
            label="Processing"
          />
          <Chip 
            size="small"
            sx={{ backgroundColor: getSeatColor('booked') }}
            label="Booked"
          />
        </Box>
      </Box>

      {/* Screen/Stage indicator */}
      <Paper sx={{ p: 1, mb: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
        <Typography variant="body2" color="text.secondary">
          SCREEN / STAGE
        </Typography>
      </Paper>

      {/* Seat Grid */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: dense ? 0.5 : 1,
          alignItems: 'center'
        }}
        role="grid"
        aria-label={ariaLabel}
      >
        {seats.map((row, rowIndex) => (
          <Box
            key={rowIndex}
            sx={{
              display: 'flex',
              gap: dense ? 0.5 : 1,
              alignItems: 'center'
            }}
          >
            {/* Row label */}
            <Typography
              variant="caption"
              sx={{ minWidth: 20, textAlign: 'center', mr: 1 }}
            >
              {String.fromCharCode(65 + rowIndex)}
            </Typography>

            {row.map((seatNumber, colIndex) => {
              const status = getSeatStatus(seatNumber);
              const isClickable = !disabled && status !== 'booked';

              return (
                <Box key={seatNumber} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant={status === 'selected' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleSeatClick(seatNumber)}
                    disabled={!isClickable}
                    sx={{
                      minWidth: dense ? 32 : 40,
                      height: dense ? 32 : 40,
                      p: 0,
                      fontSize: '0.75rem',
                      backgroundColor: status === 'booked' ? getSeatColor('booked') : undefined,
                      borderColor: getSeatColor(status),
                      color: status === 'booked' ? 'white' : undefined,
                      '&:hover': {
                        backgroundColor: isClickable ? getSeatColor('selected') : undefined
                      }
                    }}
                    role="gridcell"
                    aria-label={`Seat ${seatNumber}, ${status}`}
                  >
                    {seatNumber}
                  </Button>
                  
                  {/* Aisle gap after columns 4 */}
                  {colIndex === 3 && (
                    <Box sx={{ width: dense ? 16 : 24 }} />
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* Selection summary and booking action */}
      {selectedSeats.length > 0 && (
        <Box mt={3} p={2} sx={{ backgroundColor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="subtitle2" mb={1}>
            Selected Seats: {selectedSeats.join(', ')}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {selectedSeats.length} / {maxSelectable || 'unlimited'} seats selected
          </Typography>
          
          {/* Booking Action */}
          <Box display="flex" gap={2} alignItems="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => startOptimisticBooking(selectedSeats)}
              disabled={bookingInProgress || disabled}
              sx={{ minWidth: 120 }}
            >
              {bookingInProgress ? 'Booking...' : 'Book Selected Seats'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setSelectedSeats([])}
              disabled={bookingInProgress || disabled}
            >
              Clear Selection
            </Button>
          </Box>
        </Box>
      )}

      {/* Data source indicator */}
      {seatData && (
        <Box mt={2} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Seat data from: {seatData.source || 'API'} • Last updated: {
              new Date(seatData.timestamp).toLocaleTimeString()
            }
          </Typography>
        </Box>
      )}
    </Box>
  );
}