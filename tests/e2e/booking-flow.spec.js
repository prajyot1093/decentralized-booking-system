import { test, expect } from '@playwright/test';

test.describe('Decentralized Booking System - Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the main page
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('should complete full booking flow', async ({ page }) => {
    // Step 1: Verify app loads
    await expect(page).toHaveTitle(/Decentralized Booking/);
    
    // Step 2: Navigate to services/tickets page
    const servicesButton = page.getByRole('button', { name: /services|tickets/i });
    if (await servicesButton.isVisible()) {
      await servicesButton.click();
    } else {
      // Try navigation link
      const servicesLink = page.getByRole('link', { name: /services|tickets/i });
      await servicesLink.click();
    }

    // Step 3: Wait for services to load
    await page.waitForSelector('[data-testid="service-card"], .service-card, [class*="service"]', { timeout: 10000 });
    
    // Step 4: Select a service
    const firstService = page.locator('[data-testid="service-card"], .service-card').first();
    await expect(firstService).toBeVisible();
    await firstService.click();

    // Step 5: Open seat selection (if not already open)
    const selectSeatsButton = page.getByRole('button', { name: /select seats|book|purchase/i });
    if (await selectSeatsButton.isVisible()) {
      await selectSeatsButton.click();
    }

    // Step 6: Select seats
    await page.waitForSelector('[data-testid="seat"], button[aria-label*="Seat"]', { timeout: 5000 });
    
    // Select 2-3 seats
    const seats = page.locator('[data-testid="seat"]:not([disabled]), button[aria-label*="Seat"]:not([disabled])');
    const seatCount = Math.min(await seats.count(), 3);
    
    for (let i = 0; i < seatCount; i++) {
      await seats.nth(i).click();
      // Small delay between selections
      await page.waitForTimeout(200);
    }

    // Step 7: Proceed to booking
    const bookButton = page.getByRole('button', { name: /book selected|confirm booking|purchase/i });
    await expect(bookButton).toBeVisible();
    await bookButton.click();

    // Step 8: Handle wallet connection (mock)
    // In a real test, you'd use a test wallet or mock the wallet connection
    const connectWalletButton = page.getByRole('button', { name: /connect wallet|connect metamask/i });
    if (await connectWalletButton.isVisible({ timeout: 2000 })) {
      await connectWalletButton.click();
      
      // Mock wallet connection success
      await page.evaluate(() => {
        // Simulate wallet connection
        window.ethereum = {
          request: async ({ method, params }) => {
            if (method === 'eth_requestAccounts') {
              return ['0x742d35Cc1234567890123456789012345678901234'];
            }
            if (method === 'eth_chainId') {
              return '0x1'; // Mainnet
            }
            return null;
          },
          on: () => {},
          removeListener: () => {}
        };
        
        // Dispatch connection event
        window.dispatchEvent(new CustomEvent('wallet-connected'));
      });
    }

    // Step 9: Confirm transaction (mock)
    const confirmTransactionButton = page.getByRole('button', { name: /confirm transaction|sign|approve/i });
    if (await confirmTransactionButton.isVisible({ timeout: 3000 })) {
      await confirmTransactionButton.click();
      
      // Mock transaction success
      await page.evaluate(() => {
        // Simulate successful transaction
        const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
        window.dispatchEvent(new CustomEvent('transaction-success', {
          detail: { hash: mockTxHash }
        }));
      });
    }

    // Step 10: Verify booking confirmation
    await expect(page.getByText(/booking confirmed|transaction successful|booking complete/i))
      .toBeVisible({ timeout: 10000 });
    
    // Should show transaction hash or booking reference
    await expect(page.getByText(/0x[a-fA-F0-9]{64}|booking id|reference/i))
      .toBeVisible({ timeout: 5000 });
  });

  test('should handle wallet connection flow', async ({ page }) => {
    // Navigate to connect wallet
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    
    if (await connectButton.isVisible()) {
      await connectButton.click();
      
      // Should show wallet options
      await expect(page.getByText(/metamask|wallet connect|coinbase/i)).toBeVisible();
      
      // Select MetaMask
      const metamaskOption = page.getByText(/metamask/i);
      if (await metamaskOption.isVisible()) {
        await metamaskOption.click();
      }
    }
  });

  test('should show services list correctly', async ({ page }) => {
    // Navigate to services
    const servicesNav = page.getByRole('link', { name: /services|tickets/i });
    if (await servicesNav.isVisible()) {
      await servicesNav.click();
    }

    // Should show at least one service
    await expect(page.locator('[data-testid="service-card"], .service-card')).toHaveCountGreaterThan(0);
    
    // Each service should have required information
    const firstService = page.locator('[data-testid="service-card"], .service-card').first();
    await expect(firstService).toContainText(/.+/); // Has some text content
    
    // Should show price information
    await expect(page.getByText(/\$|ETH|price/i)).toBeVisible();
  });

  test('should handle seat selection UI', async ({ page }) => {
    // Navigate to services and select first service
    const servicesNav = page.getByRole('link', { name: /services|tickets/i });
    if (await servicesNav.isVisible()) {
      await servicesNav.click();
    }

    await page.waitForSelector('[data-testid="service-card"], .service-card');
    await page.locator('[data-testid="service-card"], .service-card').first().click();

    // Open seat selection
    const selectSeatsButton = page.getByRole('button', { name: /select seats|book/i });
    if (await selectSeatsButton.isVisible()) {
      await selectSeatsButton.click();
    }

    // Should show seat map
    await page.waitForSelector('[data-testid="seat"], button[aria-label*="Seat"]');
    
    // Should have legend/key
    await expect(page.getByText(/available|selected|booked/i)).toBeVisible();
    
    // Should be able to select a seat
    const availableSeat = page.locator('[data-testid="seat"]:not([disabled]), button[aria-label*="Seat"]:not([disabled])').first();
    await availableSeat.click();
    
    // Seat should change appearance when selected
    await expect(availableSeat).toHaveClass(/selected|active/);
  });

  test('should handle network status', async ({ page }) => {
    // Check if app handles offline state
    await page.context().setOffline(true);
    await page.reload();
    
    // Should show offline indicator
    await expect(page.getByText(/offline|no connection|cached data/i)).toBeVisible({ timeout: 5000 });
    
    // Go back online
    await page.context().setOffline(false);
    await page.reload();
    
    // Offline indicator should be gone
    await expect(page.getByText(/offline|no connection/i)).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Responsive Design Tests', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Should still be functional on mobile
    await expect(page).toHaveTitle(/Decentralized Booking/);
    
    // Navigation should be accessible (hamburger menu or similar)
    const mobileNav = page.getByRole('button', { name: /menu|navigation/i });
    if (await mobileNav.isVisible()) {
      await mobileNav.click();
    }
    
    // Services should be reachable
    const servicesLink = page.getByRole('link', { name: /services|tickets/i });
    await expect(servicesLink).toBeVisible();
  });
});