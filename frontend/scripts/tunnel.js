#!/usr/bin/env node
/*
 * Creates a localtunnel to your running dev server (default 3000) or build server (5000)
 * Usage:
 *   1. In one terminal: npm run start:lan  (or serve:build)
 *   2. In another terminal: npm run tunnel
 * Prints a public HTTPS URL + QR code you can open on any device.
 */
const lt = require('localtunnel');
const qrcode = require('qrcode-terminal');

(async () => {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000; // CRA default
  try {
    const tunnel = await lt({ port });
    const url = tunnel.url;
    console.log('\nPublic tunnel created: ' + url);
    console.log('Scan this QR code to open on mobile:\n');
    qrcode.generate(url, { small: true });

    tunnel.on('close', () => console.log('Tunnel closed.'));
  } catch (err) {
    console.error('Failed to establish tunnel:', err.message);
    process.exit(1);
  }
})();
