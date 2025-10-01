import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

export default function ServiceSkeleton() {
  return (
    <Card className="hover-card" sx={{ backdropFilter: 'blur(8px)', background:'linear-gradient(155deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' }}>
      <CardContent>
        <Skeleton variant="text" width={140} height={28} />
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="text" width={80} height={18} />
        <Box sx={{ mt:1 }}>
          <Skeleton variant="rectangular" height={36} />
        </Box>
      </CardContent>
    </Card>
  );
}
