const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const servicesRoutes = require('./routes/services');
const BlockchainIndexer = require('./indexer/BlockchainIndexer');

// Mock contract ABI for indexer
const TICKET_BOOKING_ABI = [
  "event ServiceListed(uint256 indexed serviceId, uint8 serviceType, string name, uint256 startTime, uint256 basePriceWei)",
  "event TicketPurchased(uint256 indexed ticketId, uint256 indexed serviceId, address indexed buyer, uint256[] seats, uint256 amount)",
  "function getService(uint256 serviceId) view returns (tuple(uint256 id, uint8 serviceType, address provider, string name, string origin, string destination, uint256 startTime, uint256 basePriceWei, uint256 totalSeats, uint256 seatsBitmap, bool isActive))"
];

const app = express();

// Initialize blockchain indexer
const indexer = new BlockchainIndexer(
  process.env.CONTRACT_ADDRESS,
  TICKET_BOOKING_ABI,
  servicesRoutes
);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/services', servicesRoutes);

// Indexer status endpoint
app.get('/api/indexer/status', (req, res) => {
  res.json({
    success: true,
    data: indexer.getStatus()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  
  // Start blockchain indexer
  try {
    const connected = await indexer.initialize();
    if (connected) {
      await indexer.startIndexing();
    }
  } catch (error) {
    console.error('❌ Failed to start indexer:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  indexer.stop();
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;