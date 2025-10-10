import React, { useState, useMemo } from 'react';
import { Box, Button, Typography, Chip, Paper } from '@mui/material';

/**
 * Simplified SeatMap Component - Demo Mode
 */
export default function SeatMap({
  totalSeats = 40,
  selected = [],
  onChange = () => {},
  maxSelectable = 5,
  disabled = false,
  dense = false,
  ariaLabel = 'Seat selection grid'
}) {
  const [selectedSeats, setSelectedSeats] = useState(selected);

  // Calculate grid layout
  const rows = Math.ceil(totalSeats / 8);
  const seatsPerRow = 8;

  // Mock some booked seats for demo
  const bookedSeats = [1, 5, 12, 18, 25, 33];

  const handleSeatClick = (seatNumber) => {
    if (disabled || bookedSeats.includes(seatNumber)) return;

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
    if (selectedSeats.includes(seatNumber)) return 'selected';
    return 'available';
  };

  const getSeatColor = (status) => {
    switch (status) {
      case 'booked': return '#f44336';
      case 'selected': return '#2196f3';
      case 'available': return '#4caf50';
      default: return '#9e9e9e';
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

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" mb={1}>
          Select Your Seats
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

      {/* Selection summary */}
      {selectedSeats.length > 0 && (
        <Box mt={3} p={2} sx={{ backgroundColor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="subtitle2" mb={1}>
            Selected Seats: {selectedSeats.join(', ')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedSeats.length} / {maxSelectable || 'unlimited'} seats selected
          </Typography>
        </Box>
      )}
    </Box>
  );
}