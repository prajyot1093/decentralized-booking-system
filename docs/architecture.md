```mermaid
flowchart LR
  subgraph Frontend
    A[React App<br/>(Tickets, SeatMap, Navbar)]
  end

  subgraph OnChain
    B[TicketBookingSystem Contract]
  end

  subgraph Backend
    C[Indexer / API<br/>(/api/services, /api/services/:id/seats)]
  end

  A -- read/write --> B
  A -- read fast --> C
  C -- listen events --> B
  C -- expose JSON --> A
```

Brief:
- Frontend reads canonical state from the smart contract and requests fast listings/seat snapshots from the Backend indexer.
- Backend subscribes to contract events (ServiceListed, SeatsPurchased) to maintain a fast, queryable cache.
- The contract remains the single source of truth; the indexer improves UX and performance.
