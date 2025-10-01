// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// Counters removed in OZ v5; using simple uint256 counters

/**
 * @title TicketBookingSystem
 * @notice Unified on-chain booking for Bus, Train and Movie show tickets with per-seat selection.
 * @dev This is a simplified MVP contract designed for hackathon demo purposes.
 */
contract TicketBookingSystem is Ownable, ReentrancyGuard {
    constructor() Ownable(msg.sender) {}

    enum ServiceType { Bus, Train, Movie }

    struct Service {
        uint256 id;
        ServiceType serviceType;
        address provider;
        string name;            // e.g. Bus operator / Train name / Movie title
        string origin;          // For Movie this can hold "City"; destination ignored
        string destination;     // For Movie can be theatre name (optional)
        uint256 startTime;      // Departure or show start timestamp
        uint256 basePriceWei;   // Price per seat
        uint256 totalSeats;     // Max 256 for bitmap implementation
        uint256 seatsBitmap;    // Bit set => booked
        bool isActive;
    }

    struct Ticket {
        uint256 id;
        uint256 serviceId;
        address buyer;
        uint256[] seats;        // Seats purchased in this ticket
        uint256 totalPaid;
        uint256 purchasedAt;
        bool refunded;
    }

    uint256 private _serviceIds;
    uint256 private _ticketIds;

    mapping(uint256 => Service) public services;
    mapping(uint256 => Ticket) public tickets; // ticketId => Ticket
    mapping(address => uint256[]) public userTickets; // user => ticketIds
    mapping(uint256 => uint256[]) public serviceTickets; // serviceId => ticketIds

    event ServiceListed(uint256 indexed serviceId, ServiceType serviceType, string name, uint256 startTime, uint256 basePriceWei);
    event ServiceStatusChanged(uint256 indexed serviceId, bool isActive);
    event TicketPurchased(uint256 indexed ticketId, uint256 indexed serviceId, address indexed buyer, uint256[] seats, uint256 amount);
    event TicketRefunded(uint256 indexed ticketId, uint256 amount);

    error InvalidSeatNumber(uint256 seatNumber);
    error SeatAlreadyBooked(uint256 seatNumber);
    error SeatsArrayEmpty();
    error NotTicketOwner();
    error ServiceInactive();
    error TooLateForRefund();
    error AlreadyRefunded();

    modifier validService(uint256 serviceId) {
        require(serviceId > 0 && serviceId <= _serviceIds, "Invalid service");
        _;
    }

    /**
     * @notice List a new service (bus route, train route, or movie show)
     * @param serviceType 0=Bus,1=Train,2=Movie
     * @param name Name / Title
     * @param origin Origin city / Movie city
     * @param destination Destination city / Theatre name (optional for movie)
     * @param startTime Departure or show start UNIX timestamp (seconds)
     * @param basePriceWei Price per seat in wei
     * @param totalSeats Number of seats (<=256)
     */
    function listService(
        ServiceType serviceType,
        string calldata name,
        string calldata origin,
        string calldata destination,
        uint256 startTime,
        uint256 basePriceWei,
        uint256 totalSeats
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(basePriceWei > 0, "Price required");
        require(totalSeats > 0 && totalSeats <= 256, "Seats must be 1-256");
        require(startTime > block.timestamp, "Start must be future");

    _serviceIds += 1;
    uint256 newId = _serviceIds;
        services[newId] = Service({
            id: newId,
            serviceType: serviceType,
            provider: msg.sender,
            name: name,
            origin: origin,
            destination: destination,
            startTime: startTime,
            basePriceWei: basePriceWei,
            totalSeats: totalSeats,
            seatsBitmap: 0,
            isActive: true
        });

        emit ServiceListed(newId, serviceType, name, startTime, basePriceWei);
        return newId;
    }

    /**
     * @notice Purchase seats for a service
     * @param serviceId ID of service
     * @param seatNumbers Array of seat numbers (1-based index)
     */
    function purchaseSeats(uint256 serviceId, uint256[] calldata seatNumbers)
        external
        payable
        nonReentrant
        validService(serviceId)
        returns (uint256)
    {
        Service storage svc = services[serviceId];
        if (!svc.isActive) revert ServiceInactive();
        if (seatNumbers.length == 0) revert SeatsArrayEmpty();
        require(block.timestamp < svc.startTime, "Already started");

        uint256 seatsToBuy = seatNumbers.length;
        uint256 totalCost = seatsToBuy * svc.basePriceWei;
        require(msg.value >= totalCost, "Insufficient payment");

        // Validate & mark seats
        for (uint256 i = 0; i < seatNumbers.length; i++) {
            uint256 seat = seatNumbers[i];
            if (seat == 0 || seat > svc.totalSeats) revert InvalidSeatNumber(seat);
            uint256 mask = 1 << (seat - 1);
            if ((svc.seatsBitmap & mask) != 0) revert SeatAlreadyBooked(seat);
            svc.seatsBitmap |= mask;
        }

    _ticketIds += 1;
    uint256 ticketId = _ticketIds;
        tickets[ticketId] = Ticket({
            id: ticketId,
            serviceId: serviceId,
            buyer: msg.sender,
            seats: seatNumbers,
            totalPaid: totalCost,
            purchasedAt: block.timestamp,
            refunded: false
        });

        userTickets[msg.sender].push(ticketId);
        serviceTickets[serviceId].push(ticketId);

        // Refund any excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        emit TicketPurchased(ticketId, serviceId, msg.sender, seatNumbers, totalCost);
        return ticketId;
    }

    /**
     * @notice Refund a ticket before start time (simple full refund for demo)
     */
    function refund(uint256 ticketId) external nonReentrant {
        Ticket storage t = tickets[ticketId];
        if (t.buyer != msg.sender) revert NotTicketOwner();
        if (t.refunded) revert AlreadyRefunded();
        Service storage svc = services[t.serviceId];
        if (block.timestamp + 15 minutes >= svc.startTime) revert TooLateForRefund();

        // Free seats
        for (uint256 i = 0; i < t.seats.length; i++) {
            uint256 seat = t.seats[i];
            uint256 mask = 1 << (seat - 1);
            svc.seatsBitmap &= ~mask;
        }

        t.refunded = true;
        payable(msg.sender).transfer(t.totalPaid);
        emit TicketRefunded(ticketId, t.totalPaid);
    }

    /** VIEW HELPERS **/
    function getService(uint256 serviceId) external view returns (Service memory) {
        return services[serviceId];
    }

    function getTicket(uint256 ticketId) external view returns (Ticket memory) {
        return tickets[ticketId];
    }

    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userTickets[user];
    }

    function getServiceTickets(uint256 serviceId) external view returns (uint256[] memory) {
        return serviceTickets[serviceId];
    }

    function isSeatBooked(uint256 serviceId, uint256 seatNumber) public view returns (bool) {
        Service storage svc = services[serviceId];
        if (seatNumber == 0 || seatNumber > svc.totalSeats) return false;
        uint256 mask = 1 << (seatNumber - 1);
        return (svc.seatsBitmap & mask) != 0;
    }

    function getAvailableSeats(uint256 serviceId) external view returns (uint256[] memory) {
        Service storage svc = services[serviceId];
        uint256 count;
        for (uint256 i = 1; i <= svc.totalSeats; i++) {
            if (!isSeatBooked(serviceId, i)) count++;
        }
        uint256[] memory seats = new uint256[](count);
        uint256 idx;
        for (uint256 i = 1; i <= svc.totalSeats; i++) {
            if (!isSeatBooked(serviceId, i)) {
                seats[idx++] = i;
            }
        }
        return seats;
    }

    /** ADMIN / PROVIDER **/
    function setServiceActive(uint256 serviceId, bool active) external validService(serviceId) {
        Service storage svc = services[serviceId];
        require(msg.sender == svc.provider || msg.sender == owner(), "Not authorized");
        svc.isActive = active;
        emit ServiceStatusChanged(serviceId, active);
    }

    /**
     * @notice Withdraw provider earnings (all booked seats funds accumulate in contract for demo simplicity)
     * @dev For MVP: provider withdraws proportional to seats booked for their services.
     */
    function withdrawProvider(uint256 serviceId) external validService(serviceId) nonReentrant {
        Service storage svc = services[serviceId];
        require(msg.sender == svc.provider, "Not provider");

        // Compute earnings: bookedSeats * basePrice - already withdrawn (not tracked for MVP) => For simplicity allow one-time withdraw
        uint256 bookedSeats;
        for (uint256 i = 1; i <= svc.totalSeats; i++) {
            if (isSeatBooked(serviceId, i)) bookedSeats++;
        }
        uint256 amount = bookedSeats * svc.basePriceWei;
        require(amount > 0, "Nothing to withdraw");

        // Mark as inactive to prevent double withdraw in MVP
        svc.basePriceWei = 0; // zero out so second call reverts with nothing to withdraw
        payable(msg.sender).transfer(amount);
    }
}
