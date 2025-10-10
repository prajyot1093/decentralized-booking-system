import { useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';

/**
 * Custom hook for subscribing to blockchain events
 */
export const useContractEvents = ({
  contract,
  provider,
  onServiceListed = null,
  onSeatsPurchased = null,
  onError = null,
  enabled = true
}) => {
  const subscriptionsRef = useRef(new Set());
  const reconnectTimeoutRef = useRef(null);
  const isSubscribedRef = useRef(false);

  // Clean up function
  const cleanup = useCallback(() => {
    if (contract && subscriptionsRef.current.size > 0) {
      subscriptionsRef.current.forEach(eventName => {
        try {
          contract.removeAllListeners(eventName);
        } catch (error) {
          console.warn(`Failed to remove listener for ${eventName}:`, error);
        }
      });
      subscriptionsRef.current.clear();
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    isSubscribedRef.current = false;
  }, [contract]);

  // Subscribe to events
  const subscribe = useCallback(async () => {
    if (!contract || !provider || !enabled || isSubscribedRef.current) {
      return;
    }

    try {
      console.log('Subscribing to contract events...');

      // Subscribe to ServiceListed event
      if (onServiceListed) {
        contract.on('ServiceListed', (serviceId, serviceType, name, startTime, basePriceWei, event) => {
          console.log('ServiceListed event received:', {
            serviceId: serviceId.toString(),
            serviceType,
            name,
            startTime: startTime.toString(),
            basePriceWei: basePriceWei.toString(),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });

          onServiceListed({
            serviceId: Number(serviceId),
            serviceType: Number(serviceType),
            name,
            startTime: Number(startTime),
            basePriceWei: basePriceWei.toString(),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp: new Date().toISOString()
          });
        });
        subscriptionsRef.current.add('ServiceListed');
      }

      // Subscribe to SeatsPurchased/TicketPurchased event
      if (onSeatsPurchased) {
        // Try both possible event names
        const eventNames = ['SeatsPurchased', 'TicketPurchased'];
        
        for (const eventName of eventNames) {
          try {
            contract.on(eventName, (ticketId, serviceId, buyer, seats, amount, event) => {
              console.log(`${eventName} event received:`, {
                ticketId: ticketId?.toString(),
                serviceId: serviceId?.toString(),
                buyer,
                seats: seats?.map(s => s.toString()),
                amount: amount?.toString(),
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
              });

              onSeatsPurchased({
                ticketId: ticketId ? Number(ticketId) : null,
                serviceId: serviceId ? Number(serviceId) : null,
                buyer,
                seats: seats ? seats.map(s => Number(s)) : [],
                amount: amount ? amount.toString() : '0',
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber,
                timestamp: new Date().toISOString()
              });
            });
            subscriptionsRef.current.add(eventName);
            break; // Use first successful event subscription
          } catch (err) {
            console.warn(`Failed to subscribe to ${eventName}:`, err.message);
          }
        }
      }

      // Monitor connection status
      provider.on('block', (blockNumber) => {
        // Connection is alive if we receive blocks
        console.log('New block received:', blockNumber);
      });

      provider.on('error', (error) => {
        console.error('Provider error:', error);
        if (onError) {
          onError(error);
        }
        
        // Attempt to reconnect after error
        cleanup();
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          subscribe();
        }, 5000);
      });

      isSubscribedRef.current = true;
      console.log('Successfully subscribed to contract events');

    } catch (error) {
      console.error('Failed to subscribe to events:', error);
      if (onError) {
        onError(error);
      }
    }
  }, [contract, provider, enabled, onServiceListed, onSeatsPurchased, onError, cleanup]);

  // Auto-subscribe when dependencies change
  useEffect(() => {
    if (enabled && contract && provider) {
      subscribe();
    } else {
      cleanup();
    }

    return cleanup;
  }, [enabled, contract, provider, subscribe, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isSubscribed: isSubscribedRef.current,
    resubscribe: subscribe,
    cleanup
  };
};

/**
 * Hook for cache invalidation based on events
 */
export const useEventCacheInvalidation = ({
  contract,
  provider,
  onInvalidateServices = null,
  onInvalidateSeats = null,
  enabled = true
}) => {
  const { isSubscribed } = useContractEvents({
    contract,
    provider,
    enabled,
    onServiceListed: useCallback((eventData) => {
      console.log('Cache invalidation: New service listed');
      if (onInvalidateServices) {
        onInvalidateServices('SERVICE_LISTED', eventData);
      }
    }, [onInvalidateServices]),
    
    onSeatsPurchased: useCallback((eventData) => {
      console.log('Cache invalidation: Seats purchased for service', eventData.serviceId);
      if (onInvalidateSeats) {
        onInvalidateSeats('SEATS_PURCHASED', eventData);
      }
      // Also invalidate services list as available seat count changed
      if (onInvalidateServices) {
        onInvalidateServices('SEATS_PURCHASED', eventData);
      }
    }, [onInvalidateServices, onInvalidateSeats]),
    
    onError: useCallback((error) => {
      console.warn('Event subscription error, cache may be stale:', error);
    }, [])
  });

  return { isSubscribed };
};