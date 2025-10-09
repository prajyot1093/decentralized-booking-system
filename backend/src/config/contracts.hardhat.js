// Auto-generated contract configuration for hardhat (Backend)
// Generated at: 2025-10-09T17:41:56.735Z

const networkConfig = {
  "name": "Hardhat Local",
  "chainId": 31337,
  "rpcUrl": "http://127.0.0.1:8545"
};

const contractAddresses = {
  TicketBookingSystem: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
};

const contractABIs = {
  TicketBookingSystem: [
  {
    "type": "constructor",
    "stateMutability": "undefined",
    "payable": false,
    "inputs": []
  },
  {
    "type": "error",
    "name": "AlreadyRefunded",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidSeatNumber",
    "inputs": [
      {
        "type": "uint256",
        "name": "seatNumber"
      }
    ]
  },
  {
    "type": "error",
    "name": "NotTicketOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "type": "address",
        "name": "owner"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "type": "address",
        "name": "account"
      }
    ]
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SeatAlreadyBooked",
    "inputs": [
      {
        "type": "uint256",
        "name": "seatNumber"
      }
    ]
  },
  {
    "type": "error",
    "name": "SeatsArrayEmpty",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ServiceInactive",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TooLateForRefund",
    "inputs": []
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "type": "address",
        "name": "previousOwner",
        "indexed": true
      },
      {
        "type": "address",
        "name": "newOwner",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "ServiceListed",
    "inputs": [
      {
        "type": "uint256",
        "name": "serviceId",
        "indexed": true
      },
      {
        "type": "uint8",
        "name": "serviceType",
        "indexed": false
      },
      {
        "type": "string",
        "name": "name",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "startTime",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "basePriceWei",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "ServiceStatusChanged",
    "inputs": [
      {
        "type": "uint256",
        "name": "serviceId",
        "indexed": true
      },
      {
        "type": "bool",
        "name": "isActive",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "TicketPurchased",
    "inputs": [
      {
        "type": "uint256",
        "name": "ticketId",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "serviceId",
        "indexed": true
      },
      {
        "type": "address",
        "name": "buyer",
        "indexed": true
      },
      {
        "type": "uint256[]",
        "name": "seats"
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "TicketRefunded",
    "inputs": [
      {
        "type": "uint256",
        "name": "ticketId",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "amount",
        "indexed": false
      }
    ]
  },
  {
    "type": "function",
    "name": "getAvailableSeats",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "serviceId"
      }
    ],
    "outputs": [
      {
        "type": "uint256[]",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getService",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "serviceId"
      }
    ],
    "outputs": [
      {
        "type": "tuple",
        "name": "",
        "components": [
          {
            "type": "uint256",
            "name": "id"
          },
          {
            "type": "uint8",
            "name": "serviceType"
          },
          {
            "type": "address",
            "name": "provider"
          },
          {
            "type": "string",
            "name": "name"
          },
          {
            "type": "string",
            "name": "origin"
          },
          {
            "type": "string",
            "name": "destination"
          },
          {
            "type": "uint256",
            "name": "startTime"
          },
          {
            "type": "uint256",
            "name": "basePriceWei"
          },
          {
            "type": "uint256",
            "name": "totalSeats"
          },
          {
            "type": "uint256",
            "name": "seatsBitmap"
          },
          {
            "type": "bool",
            "name": "isActive"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getServiceTickets",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "serviceId"
      }
    ],
    "outputs": [
      {
        "type": "uint256[]",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "getTicket",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "ticketId"
      }
    ],
    "outputs": [
      {
        "type": "tuple",
        "name": "",
        "components": [
          {
            "type": "uint256",
            "name": "id"
          },
          {
            "type": "uint256",
            "name": "serviceId"
          },
          {
            "type": "address",
            "name": "buyer"
          },
          {
            "type": "uint256[]",
            "name": "seats"
          },
          {
            "type": "uint256",
            "name": "totalPaid"
          },
          {
            "type": "uint256",
            "name": "purchasedAt"
          },
          {
            "type": "bool",
            "name": "refunded"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getUserTickets",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "user"
      }
    ],
    "outputs": [
      {
        "type": "uint256[]",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "isSeatBooked",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "serviceId"
      },
      {
        "type": "uint256",
        "name": "seatNumber"
      }
    ],
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "listService",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint8",
        "name": "serviceType"
      },
      {
        "type": "string",
        "name": "name"
      },
      {
        "type": "string",
        "name": "origin"
      },
      {
        "type": "string",
        "name": "destination"
      },
      {
        "type": "uint256",
        "name": "startTime"
      },
      {
        "type": "uint256",
        "name": "basePriceWei"
      },
      {
        "type": "uint256",
        "name": "totalSeats"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "owner",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "purchaseSeats",
    "constant": false,
    "stateMutability": "payable",
    "payable": true,
    "inputs": [
      {
        "type": "uint256",
        "name": "serviceId"
      },
      {
        "type": "uint256[]",
        "name": "seatNumbers"
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "refund",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "ticketId"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "constant": false,
    "payable": false,
    "inputs": [],
    "outputs": []
  },
  {
    "type": "function",
    "name": "serviceTickets",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": ""
      },
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "services",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": "id"
      },
      {
        "type": "uint8",
        "name": "serviceType"
      },
      {
        "type": "address",
        "name": "provider"
      },
      {
        "type": "string",
        "name": "name"
      },
      {
        "type": "string",
        "name": "origin"
      },
      {
        "type": "string",
        "name": "destination"
      },
      {
        "type": "uint256",
        "name": "startTime"
      },
      {
        "type": "uint256",
        "name": "basePriceWei"
      },
      {
        "type": "uint256",
        "name": "totalSeats"
      },
      {
        "type": "uint256",
        "name": "seatsBitmap"
      },
      {
        "type": "bool",
        "name": "isActive"
      }
    ]
  },
  {
    "type": "function",
    "name": "setServiceActive",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "serviceId"
      },
      {
        "type": "bool",
        "name": "active"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "tickets",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": "id"
      },
      {
        "type": "uint256",
        "name": "serviceId"
      },
      {
        "type": "address",
        "name": "buyer"
      },
      {
        "type": "uint256",
        "name": "totalPaid"
      },
      {
        "type": "uint256",
        "name": "purchasedAt"
      },
      {
        "type": "bool",
        "name": "refunded"
      }
    ]
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "newOwner"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "userTickets",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": ""
      },
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ]
  },
  {
    "type": "function",
    "name": "withdrawProvider",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "serviceId"
      }
    ],
    "outputs": []
  }
]
};

const deploymentInfo = {
  "timestamp": "2025-10-09T17:41:47.091Z",
  "blockNumber": 1
};

module.exports = {
  network: networkConfig,
  addresses: contractAddresses,
  abis: contractABIs,
  deployment: deploymentInfo
};
