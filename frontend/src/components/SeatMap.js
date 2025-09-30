import React from 'react';
import { Box, Button, Typography, Tooltip } from '@mui/material';

export default function SeatMap({ total=40, selected=[], onChange, bookedChecker }) {
  const handleToggle = (seat) => {
    if (bookedChecker && bookedChecker(seat)) return; // ignore booked
    if (selected.includes(seat)) onChange(selected.filter(s => s !== seat));
    else onChange([...selected, seat]);
  };
  const cols = 8;
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1, mt: 2 }}>
      {Array.from({ length: total }, (_, i) => i + 1).map(seat => {
        const booked = bookedChecker?.(seat);
        const active = selected.includes(seat);
        return (
          <Tooltip key={seat} title={booked ? 'Booked' : `Seat ${seat}`}> 
            <span>
              <Button
                onClick={() => handleToggle(seat)}
                size="small"
                disabled={booked}
                variant={active ? 'contained' : 'outlined'}
                color={booked ? 'error' : active ? 'primary' : 'inherit'}
                sx={{ minWidth: 0, p: 0.5, fontSize: 12, lineHeight: 1, borderRadius: 1 }}
              >{seat}</Button>
            </span>
          </Tooltip>
        );
      })}
      <Typography variant="caption" sx={{ gridColumn: `span ${cols}`, mt: 1, opacity: 0.7 }}>
        Select seats to book. Booked seats disabled.
      </Typography>
    </Box>
  );
}
