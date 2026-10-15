import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { ethers } = hre;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("--------------------------------------------------");
  console.log("Deploying KindLedger Smart Contract...");

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const organizer2 = signers[1] || deployer;
  const donor1 = signers[2] || deployer;
  const donor2 = signers[3] || deployer;
  const vendor1 = signers[4] || deployer;
  const vendor2 = signers[5] || deployer;

  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Account balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);

  const KindLedgerFactory = await ethers.getContractFactory("KindLedger");
  const kindLedger = await KindLedgerFactory.deploy();
  await kindLedger.waitForDeployment();

  const contractAddress = await kindLedger.getAddress();
  console.log(`>>> KindLedger successfully deployed to: ${contractAddress}`);

  // Seeding initial realistic campaigns for demonstration
  console.log("Seeding demonstration campaigns and public transactions...");
  const now = Math.floor(Date.now() / 1000);

  // Campaign 1: Clean Water
  const tx1 = await kindLedger.connect(deployer).createCampaign(
    "Clean Drinking Water & Solar Pumps",
    "Providing sustainably powered clean water borewells, solar pumps, and filtration kits to 5 remote village primary schools. Ensuring transparent fund tracking from initial donation to equipment supplier settlement.",
    "Clean Water & Sanitation",
    "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
    ethers.parseEther("5.0"),
    now + 86400 * 45 // 45 days
  );
  await tx1.wait();

  // Campaign 2: Pediatric Emergency Care
  const tx2 = await kindLedger.connect(organizer2).createCampaign(
    "Pediatric Emergency Care & Oxygen Concentrators",
    "Procuring modern portable oxygen concentrators and vital medical monitor units for the district general hospital's children ward to treat acute respiratory distress.",
    "Healthcare",
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
    ethers.parseEther("8.0"),
    now + 86400 * 30 // 30 days
  );
  await tx2.wait();

  // Campaign 3: Coding & Robotics Lab
  const tx3 = await kindLedger.connect(deployer).createCampaign(
    "Youth STEM & Robotics Learning Lab",
    "Equipping an open community center with 15 refurbished laptops, Arduino microcontrollers, and sensor kits to teach robotics and programming to underprivileged teenagers.",
    "Education",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    ethers.parseEther("3.5"),
    now + 86400 * 60 // 60 days
  );
  await tx3.wait();

  // Campaign 4: Stray Animal Rescue & Surgery
  const tx4 = await kindLedger.connect(organizer2).createCampaign(
    "Stray Animal Rescue & Emergency Vet Center",
    "Funding emergency treatments, spay/neuter operations, vaccinations, and winter warm bedding for abandoned street animals in municipal shelters.",
    "Animal Welfare",
    "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=80",
    ethers.parseEther("2.5"),
    now + 86400 * 15 // 15 days
  );
  await tx4.wait();

  console.log("Adding initial donations...");
  // Donations for Campaign 0
  await (await kindLedger.connect(donor1).donate(0, "Elena Vance", "Clean water is a fundamental human right. Honored to back this!", {
    value: ethers.parseEther("1.8"),
  })).wait();

  await (await kindLedger.connect(donor2).donate(0, "Anonymous Supporter", "Great initiative for the children.", {
    value: ethers.parseEther("1.0"),
  })).wait();

  // Donations for Campaign 1
  await (await kindLedger.connect(donor1).donate(1, "Marcus Cole", "Hope this helps save lives in the pediatric ward.", {
    value: ethers.parseEther("3.2"),
  })).wait();

  await (await kindLedger.connect(donor2).donate(1, "Sara Lin", "For the oxygen concentrators fund.", {
    value: ethers.parseEther("1.5"),
  })).wait();

  // Donations for Campaign 3
  await (await kindLedger.connect(donor1).donate(3, "Animal Lover 42", "Thank you for looking after stray animals!", {
    value: ethers.parseEther("2.5"), // reaches goal
  })).wait();

  console.log("Recording initial transparent payouts with verifiable invoices/purposes...");
  // Payouts for Campaign 0 by deployer
  await (await kindLedger.connect(deployer).releaseFunds(
    0,
    vendor1.address,
    ethers.parseEther("1.5"),
    "Procured 2x Solar Submersible Pump Units from AquaTech Solar Ltd (Invoice #AT-8821)"
  )).wait();

  // Payouts for Campaign 1 by organizer2
  await (await kindLedger.connect(organizer2).releaseFunds(
    1,
    vendor2.address,
    ethers.parseEther("2.8"),
    "Paid MediEquip Logistics for 3x 10L High-Flow Oxygen Concentrators"
  )).wait();

  // Payout for Campaign 3 by organizer2
  await (await kindLedger.connect(organizer2).releaseFunds(
    3,
    vendor1.address,
    ethers.parseEther("1.2"),
    "Payment to City Veterinary Clinic for emergency orthopedic surgeries & vaccinations"
  )).wait();

  console.log("Demo seed data created successfully!");

  // Export contract address and ABI to frontend/src/contracts
  const frontendContractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("KindLedger");

  fs.writeFileSync(
    path.join(frontendContractsDir, "KindLedgerAddress.json"),
    JSON.stringify({ address: contractAddress, network: hre.network.name, chainId: 31337 }, null, 2)
  );

  fs.writeFileSync(
    path.join(frontendContractsDir, "KindLedgerAbi.json"),
    JSON.stringify(contractArtifact.abi, null, 2)
  );

  console.log(`Configured frontend contract artifacts in: ${frontendContractsDir}`);
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
