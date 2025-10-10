const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Basic middleware - Production ready CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'https://decentralized-booking-demo.netlify.app',
  /\.netlify\.app$/,
  /\.vercel\.app$/,
  /\.onrender\.com$/,
  /\.render\.com$/
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Mock services data
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

// Simple API routes
app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    data: MOCK_SERVICES
  });
});

app.get('/api/services/:id', (req, res) => {
  const service = MOCK_SERVICES.find(s => s.id == req.params.id);
  if (service) {
    res.json({ success: true, data: service });
  } else {
    res.status(404).json({ success: false, error: 'Service not found' });
  }
});

app.post('/api/services/:id/book', (req, res) => {
  res.json({
    success: true,
    message: 'Booking successful (demo mode)',
    bookingId: Math.random().toString(36).substr(2, 9)
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mode: 'demo'
  });
});

// Serve static files from React build
const frontendBuildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(frontendBuildPath));

// Catch-all handler for React routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'API route not found'
    });
  }
  
  const indexPath = path.join(frontendBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(500).json({
        error: 'Frontend not built. Run "npm run build" in frontend directory.'
      });
    }
  });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Demo Server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`📡 Backend: http://localhost:${PORT}`);
  console.log(`💡 Mode: Demo (no blockchain)`);
});

module.exports = app;