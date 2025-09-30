const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const TicketBookingSystem = await hre.ethers.getContractFactory("TicketBookingSystem");
  const contract = await TicketBookingSystem.deploy();
  await contract.deployed();

  console.log("TicketBookingSystem deployed at:", contract.address);

  // Seed a sample Bus service (1 hour in future)
  const now = Math.floor(Date.now() / 1000);
  const tx1 = await contract.listService(0, "Express Coach A1", "City A", "City B", now + 3600, hre.ethers.parseEther("0.01"), 40);
  await tx1.wait();
  console.log("Seeded bus service");

  // Seed a sample Train service
  const tx2 = await contract.listService(1, "Intercity Line 7", "City A", "City C", now + 7200, hre.ethers.parseEther("0.015"), 80);
  await tx2.wait();
  console.log("Seeded train service");

  // Seed a sample Movie show
  const tx3 = await contract.listService(2, "Sci-Fi Blockbuster", "Metropolis", "Grand Cinema", now + 10800, hre.ethers.parseEther("0.005"), 100);
  await tx3.wait();
  console.log("Seeded movie show");

  console.log("All demo services seeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
