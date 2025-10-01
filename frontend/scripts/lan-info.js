#!/usr/bin/env node
// Simple helper to print LAN URL after CRA starts.
const os = require('os');
const nets = os.networkInterfaces();
let lan = null;
for (const name of Object.keys(nets)) {
  for (const ni of nets[name]) {
    if (ni.family === 'IPv4' && !ni.internal) {
      lan = ni.address; break;
    }
  }
  if (lan) break;
}
if (lan) {
  console.log(`\nLAN access:  http://${lan}:${process.env.PORT || 3000}`);
  console.log('If not reachable, allow Node through firewall.');
} else {
  console.log('No external IPv4 found.');
}
