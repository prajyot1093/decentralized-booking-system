const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('TicketBookingSystem', function () {
  let ticketSystem;
  let owner, provider, buyer1, buyer2;
  let futureTime;

  beforeEach(async function () {
    [owner, provider, buyer1, buyer2] = await ethers.getSigners();
    
    const TicketBookingSystem = await ethers.getContractFactory('TicketBookingSystem');
    ticketSystem = await TicketBookingSystem.deploy();
    
    // Set future time for service start (1 hour from now)
    futureTime = Math.floor(Date.now() / 1000) + 3600;
  });

  describe('Service Listing', function () {
    it('should allow provider to list a bus service', async function () {
      const tx = await ticketSystem.connect(provider).listService(
        0, // ServiceType.Bus
        'Express Bus Route 101',
        'New York',
        'Boston',
        futureTime,
        ethers.parseEther('0.05'),
        50 // total seats
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return ticketSystem.interface.parseLog(log).name === 'ServiceListed';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      const parsedEvent = ticketSystem.interface.parseLog(event);
      expect(parsedEvent.args[0]).to.equal(1); // serviceId
      expect(parsedEvent.args[2]).to.equal('Express Bus Route 101');

      const service = await ticketSystem.getService(1);
      expect(service.name).to.equal('Express Bus Route 101');
      expect(service.provider).to.equal(provider.address);
      expect(service.totalSeats).to.equal(50);
      expect(service.isActive).to.be.true;
    });

    it('should reject service with invalid parameters', async function () {
      // Empty name
      await expect(
        ticketSystem.connect(provider).listService(0, '', 'NYC', 'Boston', futureTime, ethers.parseEther('0.05'), 50)
      ).to.be.revertedWith('Name required');

      // Zero price
      await expect(
        ticketSystem.connect(provider).listService(0, 'Bus Route', 'NYC', 'Boston', futureTime, 0, 50)
      ).to.be.revertedWith('Price required');

      // Too many seats
      await expect(
        ticketSystem.connect(provider).listService(0, 'Bus Route', 'NYC', 'Boston', futureTime, ethers.parseEther('0.05'), 300)
      ).to.be.revertedWith('Seats must be 1-256');

      // Past start time
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      await expect(
        ticketSystem.connect(provider).listService(0, 'Bus Route', 'NYC', 'Boston', pastTime, ethers.parseEther('0.05'), 50)
      ).to.be.revertedWith('Start must be future');
    });
  });

  describe('Seat Purchasing', function () {
    beforeEach(async function () {
      // List a service first
      await ticketSystem.connect(provider).listService(
        1, // ServiceType.Train
        'High Speed Train',
        'Paris',
        'London',
        futureTime,
        ethers.parseEther('0.1'),
        20
      );
    });

    it('should allow purchasing single seat', async function () {
      const seatPrice = ethers.parseEther('0.1');
      
      const tx = await ticketSystem.connect(buyer1).purchaseSeats(
        1, // serviceId
        [5], // seat numbers
        { value: seatPrice }
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return ticketSystem.interface.parseLog(log).name === 'TicketPurchased';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
      const parsedEvent = ticketSystem.interface.parseLog(event);
      expect(parsedEvent.args[0]).to.equal(1); // ticketId
      expect(parsedEvent.args[2]).to.equal(buyer1.address);

      // Verify seat is booked
      expect(await ticketSystem.isSeatBooked(1, 5)).to.be.true;

      // Verify ticket details
      const ticket = await ticketSystem.getTicket(1);
      expect(ticket.buyer).to.equal(buyer1.address);
      expect(ticket.seats).to.deep.equal([5n]);
      expect(ticket.totalPaid).to.equal(seatPrice);
    });

    it('should allow purchasing multiple seats', async function () {
      const totalPrice = ethers.parseEther('0.3'); // 3 seats * 0.1 ETH
      
      await ticketSystem.connect(buyer1).purchaseSeats(
        1,
        [1, 5, 10],
        { value: totalPrice }
      );

      // Verify all seats are booked
      expect(await ticketSystem.isSeatBooked(1, 1)).to.be.true;
      expect(await ticketSystem.isSeatBooked(1, 5)).to.be.true;
      expect(await ticketSystem.isSeatBooked(1, 10)).to.be.true;

      // Verify unbooked seats
      expect(await ticketSystem.isSeatBooked(1, 2)).to.be.false;

      const ticket = await ticketSystem.getTicket(1);
      expect(ticket.seats).to.deep.equal([1n, 5n, 10n]);
    });

    it('should prevent double booking', async function () {
      // First purchase
      await ticketSystem.connect(buyer1).purchaseSeats(1, [3], { value: ethers.parseEther('0.1') });

      // Second purchase of same seat should fail
      await expect(
        ticketSystem.connect(buyer2).purchaseSeats(1, [3], { value: ethers.parseEther('0.1') })
      ).to.be.revertedWithCustomError(ticketSystem, 'SeatAlreadyBooked');
    });

    it('should reject invalid seat numbers', async function () {
      // Seat 0 (invalid)
      await expect(
        ticketSystem.connect(buyer1).purchaseSeats(1, [0], { value: ethers.parseEther('0.1') })
      ).to.be.revertedWithCustomError(ticketSystem, 'InvalidSeatNumber');

      // Seat beyond capacity (21 when max is 20)
      await expect(
        ticketSystem.connect(buyer1).purchaseSeats(1, [21], { value: ethers.parseEther('0.1') })
      ).to.be.revertedWithCustomError(ticketSystem, 'InvalidSeatNumber');
    });

    it('should reject insufficient payment', async function () {
      await expect(
        ticketSystem.connect(buyer1).purchaseSeats(1, [1], { value: ethers.parseEther('0.05') })
      ).to.be.revertedWith('Insufficient payment');
    });

    it('should refund excess payment', async function () {
      const initialBalance = await ethers.provider.getBalance(buyer1.address);
      const seatPrice = ethers.parseEther('0.1');
      const overpayment = ethers.parseEther('0.15');

      const tx = await ticketSystem.connect(buyer1).purchaseSeats(1, [1], { value: overpayment });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(buyer1.address);
      const actualCost = initialBalance - finalBalance;

      // Should only pay seat price + gas, excess should be refunded
      expect(actualCost).to.equal(seatPrice + gasUsed);
    });
  });

  describe('Refunds', function () {
    beforeEach(async function () {
      await ticketSystem.connect(provider).listService(
        2, // ServiceType.Movie
        'Avengers: Endgame',
        'Los Angeles',
        'AMC Theatre',
        futureTime,
        ethers.parseEther('0.02'),
        100
      );

      await ticketSystem.connect(buyer1).purchaseSeats(1, [10, 11], { value: ethers.parseEther('0.04') });
    });

    it('should allow refund before service starts', async function () {
      const initialBalance = await ethers.provider.getBalance(buyer1.address);

      const tx = await ticketSystem.connect(buyer1).refund(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      // Verify seats are freed
      expect(await ticketSystem.isSeatBooked(1, 10)).to.be.false;
      expect(await ticketSystem.isSeatBooked(1, 11)).to.be.false;

      // Verify refund amount
      const finalBalance = await ethers.provider.getBalance(buyer1.address);
      const refundReceived = finalBalance - initialBalance + gasUsed;
      expect(refundReceived).to.equal(ethers.parseEther('0.04'));

      // Verify ticket is marked as refunded
      const ticket = await ticketSystem.getTicket(1);
      expect(ticket.refunded).to.be.true;
    });

    it('should reject refund by non-owner', async function () {
      await expect(
        ticketSystem.connect(buyer2).refund(1)
      ).to.be.revertedWithCustomError(ticketSystem, 'NotTicketOwner');
    });

    it('should prevent double refund', async function () {
      await ticketSystem.connect(buyer1).refund(1);
      
      await expect(
        ticketSystem.connect(buyer1).refund(1)
      ).to.be.revertedWithCustomError(ticketSystem, 'AlreadyRefunded');
    });
  });

  describe('View Functions', function () {
    beforeEach(async function () {
      await ticketSystem.connect(provider).listService(0, 'Test Service', 'A', 'B', futureTime, ethers.parseEther('0.05'), 5);
      await ticketSystem.connect(buyer1).purchaseSeats(1, [1, 3], { value: ethers.parseEther('0.1') });
    });

    it('should return available seats', async function () {
      const availableSeats = await ticketSystem.getAvailableSeats(1);
      expect(availableSeats).to.deep.equal([2n, 4n, 5n]);
    });

    it('should return user tickets', async function () {
      const userTickets = await ticketSystem.getUserTickets(buyer1.address);
      expect(userTickets).to.deep.equal([1n]);
    });

    it('should return service tickets', async function () {
      const serviceTickets = await ticketSystem.getServiceTickets(1);
      expect(serviceTickets).to.deep.equal([1n]);
    });
  });
});
