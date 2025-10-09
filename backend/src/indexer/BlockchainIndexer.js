const { ethers } = require('ethers');
require('dotenv').config();

class BlockchainIndexer {
  constructor(contractAddress, abi, servicesRoutes) {
    this.contractAddress = contractAddress;
    this.abi = abi;
    this.servicesRoutes = servicesRoutes;
    this.provider = null;
    this.contract = null;
    this.isRunning = false;
    this.lastProcessedBlock = 0;
  }

  /**
   * Initialize the indexer with provider
   */
  async initialize() {
    try {
      // Use local hardhat node if available, otherwise use public RPC
      const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Test connection
      await this.provider.getNetwork();
      console.log(`🔗 Connected to blockchain at ${rpcUrl}`);
      
      if (this.contractAddress) {
        this.contract = new ethers.Contract(this.contractAddress, this.abi, this.provider);
        console.log(`📄 Contract loaded at ${this.contractAddress}`);
      } else {
        console.log('⚠️  No contract address provided - running in mock mode');
      }
      
      // Get current block to start listening from
      this.lastProcessedBlock = await this.provider.getBlockNumber();
      console.log(`📦 Starting from block ${this.lastProcessedBlock}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain connection:', error.message);
      console.log('🔄 Running in mock mode without blockchain connection');
      return false;
    }
  }

  /**
   * Start listening to contract events
   */
  async startIndexing() {
    if (this.isRunning) {
      console.log('⚠️  Indexer already running');
      return;
    }

    console.log('🚀 Starting blockchain indexer...');
    this.isRunning = true;

    if (!this.contract) {
      console.log('📝 No contract available - adding mock data for development');
      this.addMockData();
      console.log('✅ Mock data loaded successfully');
      return;
    }

    try {
      // Listen to ServiceListed events
      this.contract.on('ServiceListed', async (serviceId, serviceType, name, startTime, basePriceWei, event) => {
        console.log(`📅 ServiceListed event: ${name} (ID: ${serviceId})`);
        await this.handleServiceListed(serviceId, event);
      });

      // Listen to TicketPurchased events
      this.contract.on('TicketPurchased', async (ticketId, serviceId, buyer, seats, amount, event) => {
        console.log(`🎫 TicketPurchased event: Service ${serviceId}, Seats: ${seats}`);
        await this.handleTicketPurchased(serviceId, seats, event);
      });

      // Process historical events
      await this.processHistoricalEvents();

      console.log('✅ Indexer started successfully');
    } catch (error) {
      console.error('❌ Error starting indexer:', error);
      this.isRunning = false;
    }
  }

  /**
   * Process historical events from the contract
   */
  async processHistoricalEvents() {
    if (!this.contract) return;

    try {
      console.log('📚 Processing historical events...');
      
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Last 10k blocks
      
      // Get ServiceListed events
      const serviceListedFilter = this.contract.filters.ServiceListed();
      const serviceEvents = await this.contract.queryFilter(serviceListedFilter, fromBlock, currentBlock);
      
      console.log(`Found ${serviceEvents.length} historical ServiceListed events`);
      
      for (const event of serviceEvents) {
        await this.handleServiceListed(event.args[0], event);
      }

      // Get TicketPurchased events
      const ticketPurchasedFilter = this.contract.filters.TicketPurchased();
      const ticketEvents = await this.contract.queryFilter(ticketPurchasedFilter, fromBlock, currentBlock);
      
      console.log(`Found ${ticketEvents.length} historical TicketPurchased events`);
      
      for (const event of ticketEvents) {
        await this.handleTicketPurchased(event.args[1], event.args[3], event);
      }

      console.log('✅ Historical events processed');
    } catch (error) {
      console.error('❌ Error processing historical events:', error);
    }
  }

  /**
   * Handle ServiceListed event
   */
  async handleServiceListed(serviceId, event) {
    try {
      if (!this.contract) return;

      const serviceData = await this.contract.getService(serviceId);
      this.servicesRoutes.updateServiceCache({
        id: serviceData[0],
        serviceType: serviceData[1],
        provider: serviceData[2],
        name: serviceData[3],
        origin: serviceData[4],
        destination: serviceData[5],
        startTime: serviceData[6],
        basePriceWei: serviceData[7],
        totalSeats: serviceData[8],
        seatsBitmap: serviceData[9],
        isActive: serviceData[10]
      });
    } catch (error) {
      console.error(`❌ Error handling ServiceListed for service ${serviceId}:`, error);
    }
  }

  /**
   * Handle TicketPurchased event
   */
  async handleTicketPurchased(serviceId, seats, event) {
    try {
      if (!this.contract) return;

      // Refresh service data to get updated seatsBitmap
      const serviceData = await this.contract.getService(serviceId);
      this.servicesRoutes.updateServiceCache({
        id: serviceData[0],
        serviceType: serviceData[1],
        provider: serviceData[2],
        name: serviceData[3],
        origin: serviceData[4],
        destination: serviceData[5],
        startTime: serviceData[6],
        basePriceWei: serviceData[7],
        totalSeats: serviceData[8],
        seatsBitmap: serviceData[9],
        isActive: serviceData[10]
      });

      // Invalidate seat cache
      this.servicesRoutes.invalidateSeatCache(parseInt(serviceId));
    } catch (error) {
      console.error(`❌ Error handling TicketPurchased for service ${serviceId}:`, error);
    }
  }

  /**
   * Add mock data for development without blockchain
   */
  addMockData() {
    const mockServices = [
      {
        id: 1,
        serviceType: 0, // Bus
        provider: '0x1234567890123456789012345678901234567890',
        name: 'Express Bus NYC-Boston',
        origin: 'New York',
        destination: 'Boston',
        startTime: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
        basePriceWei: ethers.parseEther('0.05').toString(),
        totalSeats: 50,
        seatsBitmap: '0x1A2B3C', // Some seats booked
        isActive: true
      },
      {
        id: 2,
        serviceType: 1, // Train
        provider: '0x2345678901234567890123456789012345678901',
        name: 'High Speed Rail LA-SF',
        origin: 'Los Angeles',
        destination: 'San Francisco',
        startTime: Math.floor(Date.now() / 1000) + 10800, // 3 hours from now
        basePriceWei: ethers.parseEther('0.12').toString(),
        totalSeats: 100,
        seatsBitmap: '0x0', // No seats booked
        isActive: true
      },
      {
        id: 3,
        serviceType: 2, // Movie
        provider: '0x3456789012345678901234567890123456789012',
        name: 'Avengers: Endgame',
        origin: 'Los Angeles',
        destination: 'AMC Century City',
        startTime: Math.floor(Date.now() / 1000) + 5400, // 1.5 hours from now
        basePriceWei: ethers.parseEther('0.025').toString(),
        totalSeats: 200,
        seatsBitmap: '0x7FF', // Many seats booked
        isActive: true
      }
    ];

    mockServices.forEach(service => {
      this.servicesRoutes.updateServiceCache(service);
    });

    console.log('✅ Added mock service data for development');
  }

  /**
   * Stop the indexer
   */
  stop() {
    if (!this.isRunning) return;

    console.log('🛑 Stopping blockchain indexer...');
    
    if (this.contract) {
      this.contract.removeAllListeners();
    }
    
    this.isRunning = false;
    console.log('✅ Indexer stopped');
  }

  /**
   * Get indexer status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasContract: !!this.contract,
      hasProvider: !!this.provider,
      lastProcessedBlock: this.lastProcessedBlock,
      contractAddress: this.contractAddress
    };
  }
}

module.exports = BlockchainIndexer;