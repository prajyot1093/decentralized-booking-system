const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');

// In-memory cache for demo - replace with Redis in production
let servicesCache = new Map();
let seatsCache = new Map();

// Mock contract ABI (minimal for indexer)
const TICKET_BOOKING_ABI = [
  "event ServiceListed(uint256 indexed serviceId, uint8 serviceType, string name, uint256 startTime, uint256 basePriceWei)",
  "event TicketPurchased(uint256 indexed ticketId, uint256 indexed serviceId, address indexed buyer, uint256[] seats, uint256 amount)",
  "function getService(uint256 serviceId) view returns (tuple(uint256 id, uint8 serviceType, address provider, string name, string origin, string destination, uint256 startTime, uint256 basePriceWei, uint256 totalSeats, uint256 seatsBitmap, bool isActive))",
  "function isSeatBooked(uint256 serviceId, uint256 seatNumber) view returns (bool)",
  "function getAvailableSeats(uint256 serviceId) view returns (uint256[])"
];

/**
 * @route GET /api/services/:id/seats
 * @desc Get seat occupancy for a specific service
 * @access Public
 */
router.get('/:id/seats', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    
    if (isNaN(serviceId) || serviceId < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid service ID'
      });
    }

    // Get from cache first
    const cacheKey = `seats_${serviceId}`;
    let seatData = seatsCache.get(cacheKey);
    
    if (!seatData) {
      // Generate seat data for the service
      const service = servicesCache.get(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      const totalSeats = service.totalSeats || 100;
      const bookedSeats = [];
      
      // Mock some booked seats for demo
      const bookingRate = Math.random() * 0.3; // 0-30% occupancy
      const numBooked = Math.floor(totalSeats * bookingRate);
      
      for (let i = 0; i < numBooked; i++) {
        const seatNum = Math.floor(Math.random() * totalSeats) + 1;
        const row = String.fromCharCode(65 + Math.floor((seatNum - 1) / 10)); // A, B, C...
        const seat = ((seatNum - 1) % 10) + 1;
        const seatId = `${row}-${seat}`;
        
        if (!bookedSeats.includes(seatId)) {
          bookedSeats.push(seatId);
        }
      }

      seatData = {
        serviceId,
        totalSeats,
        bookedSeats: bookedSeats.sort(),
        availableSeats: totalSeats - bookedSeats.length,
        timestamp: new Date().toISOString(),
        cacheExpiry: Date.now() + (5 * 60 * 1000) // 5 minutes
      };

      // Cache the result
      seatsCache.set(cacheKey, seatData);
      
      // Auto-expire cache entries
      setTimeout(() => {
        seatsCache.delete(cacheKey);
      }, 5 * 60 * 1000);
    }

    // Check if cache is expired
    if (seatData.cacheExpiry < Date.now()) {
      seatsCache.delete(cacheKey);
      // Recursive call to regenerate data
      return router.handle(req, res);
    }

    res.json({
      success: true,
      data: {
        serviceId: seatData.serviceId,
        totalSeats: seatData.totalSeats,
        bookedSeats: seatData.bookedSeats,
        availableSeats: seatData.availableSeats,
        timestamp: seatData.timestamp
      }
    });

  } catch (error) {
    console.error('Error fetching seat data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/services
 * @desc Get all active services
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const { type, origin, destination, startDate, endDate } = req.query;
    
    let services = Array.from(servicesCache.values());
    
    // Apply filters
    if (type) {
      const serviceType = parseInt(type);
      services = services.filter(s => s.serviceType === serviceType);
    }
    
    if (origin) {
      services = services.filter(s => 
        s.origin.toLowerCase().includes(origin.toLowerCase())
      );
    }
    
    if (destination) {
      services = services.filter(s => 
        s.destination.toLowerCase().includes(destination.toLowerCase())
      );
    }
    
    if (startDate) {
      const start = new Date(startDate).getTime() / 1000;
      services = services.filter(s => s.startTime >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate).getTime() / 1000;
      services = services.filter(s => s.startTime <= end);
    }
    
    // Only return active services
    services = services.filter(s => s.isActive);
    
    // Sort by start time
    services.sort((a, b) => a.startTime - b.startTime);
    
    res.json({
      success: true,
      data: services,
      total: services.length
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
});

/**
 * @route GET /api/services/:id
 * @desc Get specific service details
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    
    if (!serviceId || serviceId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid service ID'
      });
    }
    
    const service = servicesCache.get(serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service'
    });
  }
});

/**
 * @route GET /api/services/:id/seats
 * @desc Get seat availability for a service
 * @access Public
 */
router.get('/:id/seats', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    
    if (!serviceId || serviceId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid service ID'
      });
    }
    
    const service = servicesCache.get(serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    
    // Get cached seat availability or calculate from blockchain
    let seatInfo = seatsCache.get(serviceId);
    
    if (!seatInfo) {
      // Create seat map from bitmap
      const bookedSeats = [];
      const availableSeats = [];
      
      for (let i = 1; i <= service.totalSeats; i++) {
        const mask = BigInt(1) << BigInt(i - 1);
        const isBooked = (BigInt(service.seatsBitmap) & mask) !== BigInt(0);
        
        if (isBooked) {
          bookedSeats.push(i);
        } else {
          availableSeats.push(i);
        }
      }
      
      seatInfo = {
        totalSeats: service.totalSeats,
        bookedSeats,
        availableSeats,
        occupancyRate: (bookedSeats.length / service.totalSeats) * 100
      };
      
      // Cache for 30 seconds
      seatsCache.set(serviceId, seatInfo);
      setTimeout(() => seatsCache.delete(serviceId), 30000);
    }
    
    res.json({
      success: true,
      data: {
        serviceId,
        ...seatInfo,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching seat availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seat availability'
    });
  }
});

/**
 * @route GET /api/services/stats
 * @desc Get overall platform statistics
 * @access Public
 */
router.get('/stats/platform', async (req, res) => {
  try {
    const services = Array.from(servicesCache.values());
    const activeServices = services.filter(s => s.isActive);
    
    const stats = {
      totalServices: services.length,
      activeServices: activeServices.length,
      serviceTypes: {
        bus: services.filter(s => s.serviceType === 0).length,
        train: services.filter(s => s.serviceType === 1).length,
        movie: services.filter(s => s.serviceType === 2).length
      },
      totalSeats: services.reduce((sum, s) => sum + s.totalSeats, 0),
      bookedSeats: services.reduce((sum, s) => {
        const bookedCount = s.seatsBitmap.toString(2).split('1').length - 1;
        return sum + bookedCount;
      }, 0)
    };
    
    stats.occupancyRate = stats.totalSeats > 0 ? 
      (stats.bookedSeats / stats.totalSeats) * 100 : 0;
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform statistics'
    });
  }
});

// Helper function to update service cache from blockchain events
function updateServiceCache(serviceData) {
  const service = {
    id: parseInt(serviceData.id),
    serviceType: parseInt(serviceData.serviceType),
    provider: serviceData.provider,
    name: serviceData.name,
    origin: serviceData.origin,
    destination: serviceData.destination,
    startTime: parseInt(serviceData.startTime),
    basePriceWei: serviceData.basePriceWei.toString(),
    basePriceEth: ethers.formatEther(serviceData.basePriceWei),
    totalSeats: parseInt(serviceData.totalSeats),
    seatsBitmap: serviceData.seatsBitmap.toString(),
    isActive: serviceData.isActive,
    createdAt: new Date().toISOString()
  };
  
  servicesCache.set(service.id, service);
  console.log(`📝 Updated service cache: ${service.name} (ID: ${service.id})`);
}

// Helper function to invalidate seat cache when seats are purchased
function invalidateSeatCache(serviceId) {
  seatsCache.delete(serviceId);
  console.log(`🗑️ Invalidated seat cache for service ${serviceId}`);
}

// Export helper functions for indexer
router.updateServiceCache = updateServiceCache;
router.invalidateSeatCache = invalidateSeatCache;

module.exports = router;