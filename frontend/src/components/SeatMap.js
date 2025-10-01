import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Typography, Tooltip } from '@mui/material';

/**
 * SeatMap Component (accessible + adaptive)
 * Props:
 *  - schema: { mode: 'bus'|'train'|'cinema'; rows: number; seatsPerRow: number; aisleAfter?: number[]; seatLabels?: string[][] }
 *  - total (legacy fallback)
 *  - selected: number[] | string[] (seat ids)
 *  - onChange(newSelected)
 *  - bookedChecker(seatId) => boolean
 *  - maxSelectable?: number
 *  - disabled?: boolean
 *  - dense?: boolean (smaller spacing)
 *  - ariaLabel?: string
 */
export default function SeatMap({
  schema,
  total = 40,
  selected = [],
  onChange = () => {},
  bookedChecker,
  maxSelectable,
  disabled = false,
  dense = false,
  ariaLabel = 'Seat selection grid'
}) {
  // Derived seat list generation
  const rows = schema?.rows || Math.ceil(total / (schema?.seatsPerRow || 8));
  const seatsPerRow = schema?.seatsPerRow || 8;
  const aisleAfter = schema?.aisleAfter || []; // array of column indices after which an aisle gap appears

  const allSeats = useMemo(() => {
    const list = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < seatsPerRow; c++) {
        const linearIndex = r * seatsPerRow + c + 1;
        if (!schema && linearIndex > total) break;
        const rowLabel = String.fromCharCode(65 + r); // A,B,C,...
        const seatId = `${rowLabel}-${c + 1}`; // e.g., C-5
        const display = schema?.seatLabels?.[r]?.[c] || (c + 1).toString();
        list.push({ seatId, row: r, col: c, label: display, linear: linearIndex });
      }
    }
    return list;
  }, [rows, seatsPerRow, schema, total]);

  // Debounced change dispatch to avoid thrash
  const pendingRef = useRef(null);
  const [internalSelection, setInternalSelection] = useState(selected);
  useEffect(() => { setInternalSelection(selected); }, [selected]);
  useEffect(() => {
    if (pendingRef.current) clearTimeout(pendingRef.current);
    pendingRef.current = setTimeout(() => onChange(internalSelection), 120);
    return () => clearTimeout(pendingRef.current);
  }, [internalSelection, onChange]);

  const isBooked = useCallback((seatIdOrNum) => {
    return bookedChecker ? bookedChecker(seatIdOrNum) : false;
  }, [bookedChecker]);

  const toggleSeat = (s) => {
    if (disabled) return;
    if (isBooked(s)) return;
    const already = internalSelection.includes(s);
    if (already) {
      setInternalSelection(internalSelection.filter(x => x !== s));
    } else {
      if (maxSelectable && internalSelection.length >= maxSelectable) return;
      setInternalSelection([...internalSelection, s]);
    }
  };

  // Keyboard navigation across grid (roving tabindex pattern)
  const gridRef = useRef(null);
  const seatButtonRefs = useRef([]);
  const focusIndexRef = useRef(0);

  const handleKeyDown = (e) => {
    const key = e.key;
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','Enter',' '].includes(key)) return;
    e.preventDefault();
    const max = allSeats.length - 1;
    let idx = focusIndexRef.current;
    const cols = seatsPerRow;
    switch (key) {
      case 'ArrowRight': idx = Math.min(max, idx + 1); break;
      case 'ArrowLeft': idx = Math.max(0, idx - 1); break;
      case 'ArrowDown': idx = Math.min(max, idx + cols); break;
      case 'ArrowUp': idx = Math.max(0, idx - cols); break;
      case 'Home': idx = 0; break;
      case 'End': idx = max; break;
      case 'Enter':
      case ' ': {
        const seatObj = allSeats[idx];
        if (seatObj) toggleSeat(seatObj.seatId);
        return;
      }
      default: break;
    }
    focusIndexRef.current = idx;
    const btn = seatButtonRefs.current[idx];
    if (btn) btn.focus();
  };

  return (
    <Box
      ref={gridRef}
      role="grid"
      aria-label={ariaLabel}
      aria-rowcount={rows}
      aria-colcount={seatsPerRow}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${seatsPerRow + aisleAfter.length} , 1fr)`,
        gap: dense ? 0.5 : 1,
        mt: 2,
        outline: 'none'
      }}
    >
      {allSeats.map((s, i) => {
        // Adjust column index to account for aisles
        const insertAisleBefore = aisleAfter.includes(s.col) ? ' aisle-before' : '';
        const active = internalSelection.includes(s.seatId);
        const booked = isBooked(s.seatId);
        return (
            <Tooltip key={s.seatId} title={booked ? 'Booked' : `Seat ${s.seatId}`}>
              <span
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center'
                }}
                className={insertAisleBefore ? 'seat-cell-aisle' : ''}
              >
                <Button
                  ref={el => { seatButtonRefs.current[i] = el; }}
                  role="gridcell"
                  aria-selected={active ? 'true' : 'false'}
                  aria-label={`Seat ${s.seatId}${booked ? ' (booked)' : active ? ' (selected)' : ''}`}
                  disabled={booked || disabled}
                  onClick={() => toggleSeat(s.seatId)}
                  size={dense ? 'small' : 'medium'}
                  variant={active ? 'contained' : 'outlined'}
                  color={booked ? 'error' : active ? 'primary' : 'inherit'}
                  tabIndex={i === 0 ? 0 : -1}
                  sx={{
                    minWidth: dense ? 30 : 40,
                    p: dense ? 0.4 : 0.8,
                    fontSize: dense ? 11 : 13,
                    lineHeight: 1,
                    borderRadius: 1.2,
                    position: 'relative'
                  }}
                >{s.label}</Button>
              </span>
            </Tooltip>
        );
      })}
      <Typography variant="caption" sx={{ gridColumn: `1 / span ${seatsPerRow + aisleAfter.length}`, mt: 1, opacity: 0.7 }}>
        Use arrow keys to navigate, Enter/Space to toggle. Booked seats disabled.
      </Typography>
    </Box>
  );
}
