// Vercel API Route - Services
const MOCK_SERVICES = [
  {
    id: 1,
    name: 'Movie Theater - Avengers Endgame',
    description: 'Premium IMAX experience with luxury seating',
    pricePerSeat: 12.50,
    totalSeats: 100,
    availableSeats: 75,
    type: 'entertainment',
    status: 'active',
    image: 'https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Movie+Theater',
    schedule: '7:00 PM - 10:30 PM'
  },
  {
    id: 2,
    name: 'Concert Hall - Jazz Night',
    description: 'Intimate jazz performance with world-class musicians',
    pricePerSeat: 25.00,
    totalSeats: 150,
    availableSeats: 42,
    type: 'music',
    status: 'active',
    image: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Concert+Hall',
    schedule: '8:00 PM - 11:00 PM'
  },
  {
    id: 3,
    name: 'Sports Arena - Basketball Finals',
    description: 'Championship game with premium court-side options',
    pricePerSeat: 35.00,
    totalSeats: 200,
    availableSeats: 18,
    type: 'sports',
    status: 'active',
    image: 'https://via.placeholder.com/300x200/FF8B94/FFFFFF?text=Sports+Arena',
    schedule: '6:30 PM - 9:30 PM'
  },
  {
    id: 4,
    name: 'Theater - Broadway Musical',
    description: 'Award-winning musical with full orchestra',
    pricePerSeat: 45.00,
    totalSeats: 80,
    availableSeats: 12,
    type: 'theater',
    status: 'active',
    image: 'https://via.placeholder.com/300x200/A8E6CF/FFFFFF?text=Broadway+Theater',
    schedule: '7:30 PM - 10:00 PM'
  }
];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: MOCK_SERVICES,
      total: MOCK_SERVICES.length,
      timestamp: new Date().toISOString(),
      platform: 'vercel'
    });
  } else if (req.method === 'POST') {
    // Mock booking endpoint
    const { serviceId, seatNumbers, userAddress } = req.body;
    
    if (!serviceId || !seatNumbers || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: serviceId, seatNumbers, userAddress'
      });
    }

    // Mock successful booking
    res.status(200).json({
      success: true,
      bookingId: `booking_${Date.now()}`,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      serviceId,
      seatNumbers,
      userAddress,
      timestamp: new Date().toISOString(),
      status: 'confirmed'
    });
  } else {
    res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['GET', 'POST'] 
    });
  }
}