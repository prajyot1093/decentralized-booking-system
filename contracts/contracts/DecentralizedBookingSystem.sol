// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Counters utility removed in OZ v5; using simple uint256 counters

/**
 * @title DecentralizedBookingSystem
 * @dev Main contract for handling property bookings on blockchain
 */
contract DecentralizedBookingSystem is ReentrancyGuard, Ownable {
    constructor() Ownable(msg.sender) {}
    uint256 private _propertyIds;
    uint256 private _bookingIds;
    
    // Property structure
    struct Property {
        uint256 id;
        address owner;
        string name;
        string description;
        string location;
        uint256 pricePerNight;
        bool isActive;
        string[] amenities;
        string imageHash; // IPFS hash
    }
    
    // Booking structure
    struct Booking {
        uint256 id;
        uint256 propertyId;
        address guest;
        uint256 checkIn;
        uint256 checkOut;
        uint256 totalAmount;
        BookingStatus status;
        uint256 createdAt;
    }
    
    enum BookingStatus {
        Pending,
        Confirmed,
        CheckedIn,
        CheckedOut,
        Cancelled,
        Disputed
    }
    
    // Mappings
    mapping(uint256 => Property) public properties;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public ownerProperties;
    mapping(address => uint256[]) public guestBookings;
    mapping(uint256 => uint256[]) public propertyBookings;
    
    // Events
    event PropertyListed(
        uint256 indexed propertyId,
        address indexed owner,
        string name,
        uint256 pricePerNight
    );
    
    event BookingCreated(
        uint256 indexed bookingId,
        uint256 indexed propertyId,
        address indexed guest,
        uint256 checkIn,
        uint256 checkOut,
        uint256 totalAmount
    );
    
    event BookingStatusChanged(
        uint256 indexed bookingId,
        BookingStatus oldStatus,
        BookingStatus newStatus
    );
    
    event PaymentProcessed(
        uint256 indexed bookingId,
        address indexed guest,
        uint256 amount
    );
    
    // Modifiers
    modifier onlyPropertyOwner(uint256 _propertyId) {
        require(properties[_propertyId].owner == msg.sender, "Not property owner");
        _;
    }
    
    modifier onlyBookingGuest(uint256 _bookingId) {
        require(bookings[_bookingId].guest == msg.sender, "Not booking guest");
        _;
    }
    
    modifier validProperty(uint256 _propertyId) {
        require(_propertyId > 0 && _propertyId <= _propertyIds, "Invalid property ID");
        require(properties[_propertyId].isActive, "Property not active");
        _;
    }
    
    /**
     * @dev List a new property for booking
     */
    function listProperty(
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _pricePerNight,
        string[] memory _amenities,
        string memory _imageHash
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name required");
        require(_pricePerNight > 0, "Price must be greater than 0");
        
    _propertyIds += 1;
    uint256 newPropertyId = _propertyIds;
        
        properties[newPropertyId] = Property({
            id: newPropertyId,
            owner: msg.sender,
            name: _name,
            description: _description,
            location: _location,
            pricePerNight: _pricePerNight,
            isActive: true,
            amenities: _amenities,
            imageHash: _imageHash
        });
        
        ownerProperties[msg.sender].push(newPropertyId);
        
        emit PropertyListed(newPropertyId, msg.sender, _name, _pricePerNight);
        
        return newPropertyId;
    }
    
    /**
     * @dev Create a new booking
     */
    function createBooking(
        uint256 _propertyId,
        uint256 _checkIn,
        uint256 _checkOut
    ) external payable validProperty(_propertyId) nonReentrant returns (uint256) {
        require(_checkIn > block.timestamp, "Check-in must be in future");
        require(_checkOut > _checkIn, "Check-out must be after check-in");
        require(!isPropertyBooked(_propertyId, _checkIn, _checkOut), "Property already booked");
        
        Property memory property = properties[_propertyId];
        uint256 nights = (_checkOut - _checkIn) / 86400; // seconds in a day
        uint256 totalAmount = nights * property.pricePerNight;
        
        require(msg.value >= totalAmount, "Insufficient payment");
        
    _bookingIds += 1;
    uint256 newBookingId = _bookingIds;
        
        bookings[newBookingId] = Booking({
            id: newBookingId,
            propertyId: _propertyId,
            guest: msg.sender,
            checkIn: _checkIn,
            checkOut: _checkOut,
            totalAmount: totalAmount,
            status: BookingStatus.Confirmed,
            createdAt: block.timestamp
        });
        
        guestBookings[msg.sender].push(newBookingId);
        propertyBookings[_propertyId].push(newBookingId);
        
        // Refund excess payment
        if (msg.value > totalAmount) {
            payable(msg.sender).transfer(msg.value - totalAmount);
        }
        
        emit BookingCreated(newBookingId, _propertyId, msg.sender, _checkIn, _checkOut, totalAmount);
        emit PaymentProcessed(newBookingId, msg.sender, totalAmount);
        
        return newBookingId;
    }
    
    /**
     * @dev Check if property is available for given dates
     */
    function isPropertyBooked(
        uint256 _propertyId,
        uint256 _checkIn,
        uint256 _checkOut
    ) public view returns (bool) {
        uint256[] memory bookingIds = propertyBookings[_propertyId];
        
        for (uint256 i = 0; i < bookingIds.length; i++) {
            Booking memory booking = bookings[bookingIds[i]];
            
            if (booking.status == BookingStatus.Confirmed || 
                booking.status == BookingStatus.CheckedIn) {
                
                if ((_checkIn >= booking.checkIn && _checkIn < booking.checkOut) ||
                    (_checkOut > booking.checkIn && _checkOut <= booking.checkOut) ||
                    (_checkIn <= booking.checkIn && _checkOut >= booking.checkOut)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * @dev Confirm check-in
     */
    function checkIn(uint256 _bookingId) external onlyBookingGuest(_bookingId) {
        Booking storage booking = bookings[_bookingId];
        require(booking.status == BookingStatus.Confirmed, "Booking not confirmed");
        require(block.timestamp >= booking.checkIn, "Too early for check-in");
        require(block.timestamp < booking.checkOut, "Booking expired");
        
        BookingStatus oldStatus = booking.status;
        booking.status = BookingStatus.CheckedIn;
        
        emit BookingStatusChanged(_bookingId, oldStatus, BookingStatus.CheckedIn);
    }
    
    /**
     * @dev Confirm check-out and release payment
     */
    function checkOut(uint256 _bookingId) external onlyBookingGuest(_bookingId) {
        Booking storage booking = bookings[_bookingId];
        require(booking.status == BookingStatus.CheckedIn, "Not checked in");
        
        BookingStatus oldStatus = booking.status;
        booking.status = BookingStatus.CheckedOut;
        
        // Release payment to property owner
        Property memory property = properties[booking.propertyId];
        payable(property.owner).transfer(booking.totalAmount);
        
        emit BookingStatusChanged(_bookingId, oldStatus, BookingStatus.CheckedOut);
    }
    
    /**
     * @dev Cancel booking (before check-in)
     */
    function cancelBooking(uint256 _bookingId) external onlyBookingGuest(_bookingId) {
        Booking storage booking = bookings[_bookingId];
        require(booking.status == BookingStatus.Confirmed, "Cannot cancel booking");
        require(block.timestamp < booking.checkIn, "Cannot cancel after check-in time");
        
        BookingStatus oldStatus = booking.status;
        booking.status = BookingStatus.Cancelled;
        
        // Refund payment (minus cancellation fee)
        uint256 cancellationFee = booking.totalAmount / 10; // 10% fee
        uint256 refundAmount = booking.totalAmount - cancellationFee;
        
        payable(booking.guest).transfer(refundAmount);
        
        // Send cancellation fee to property owner
        Property memory property = properties[booking.propertyId];
        payable(property.owner).transfer(cancellationFee);
        
        emit BookingStatusChanged(_bookingId, oldStatus, BookingStatus.Cancelled);
    }
    
    /**
     * @dev Update property details
     */
    function updateProperty(
        uint256 _propertyId,
        string memory _name,
        string memory _description,
        uint256 _pricePerNight,
        bool _isActive
    ) external onlyPropertyOwner(_propertyId) {
        Property storage property = properties[_propertyId];
        property.name = _name;
        property.description = _description;
        property.pricePerNight = _pricePerNight;
        property.isActive = _isActive;
    }
    
    // View functions
    function getProperty(uint256 _propertyId) external view returns (Property memory) {
        return properties[_propertyId];
    }
    
    function getBooking(uint256 _bookingId) external view returns (Booking memory) {
        return bookings[_bookingId];
    }
    
    function getOwnerProperties(address _owner) external view returns (uint256[] memory) {
        return ownerProperties[_owner];
    }
    
    function getGuestBookings(address _guest) external view returns (uint256[] memory) {
        return guestBookings[_guest];
    }
    
    function getTotalProperties() external view returns (uint256) { return _propertyIds; }
    function getTotalBookings() external view returns (uint256) { return _bookingIds; }
}