import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("KindLedger Smart Contract", function () {
  let kindLedger;
  let owner, organizer, donor1, donor2, recipient;

  beforeEach(async function () {
    [owner, organizer, donor1, donor2, recipient] = await ethers.getSigners();

    const KindLedgerFactory = await ethers.getContractFactory("KindLedger");
    kindLedger = await KindLedgerFactory.deploy();
    await kindLedger.waitForDeployment();
  });

  describe("Campaign Creation", function () {
    it("should allow creating a valid campaign", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now
      const goal = ethers.parseEther("5.0");

      const tx = await kindLedger.connect(organizer).createCampaign(
        "Clean Water for Rural Schools",
        "Building solar-powered filtration systems for 5 schools.",
        "Infrastructure",
        "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
        goal,
        deadline
      );
      await tx.wait();

      expect(await kindLedger.campaignCount()).to.equal(1n);

      const campaign = await kindLedger.getCampaign(0);
      expect(campaign.title).to.equal("Clean Water for Rural Schools");
      expect(campaign.organizer).to.equal(organizer.address);
      expect(campaign.goal).to.equal(goal);
      expect(campaign.totalDonated).to.equal(0n);
      expect(campaign.totalReleased).to.equal(0n);
    });

    it("should reject campaign with past deadline or zero goal", async function () {
      const pastDeadline = Math.floor(Date.now() / 1000) - 1000;
      await expect(
        kindLedger.connect(organizer).createCampaign("Test", "Desc", "Cat", "", ethers.parseEther("1"), pastDeadline)
      ).to.be.revertedWith("KindLedger: Deadline must be in the future");

      const futureDeadline = Math.floor(Date.now() / 1000) + 10000;
      await expect(
        kindLedger.connect(organizer).createCampaign("Test", "Desc", "Cat", "", 0, futureDeadline)
      ).to.be.revertedWith("KindLedger: Fundraising goal must be greater than zero");
    });
  });

  describe("Donations", function () {
    let campaignId;
    let deadline;
    const goal = ethers.parseEther("10.0");

    beforeEach(async function () {
      deadline = Math.floor(Date.now() / 1000) + 86400 * 10;
      const tx = await kindLedger.connect(organizer).createCampaign(
        "Community Kitchen Relief",
        "Providing hot meals daily.",
        "Food Security",
        "",
        goal,
        deadline
      );
      await tx.wait();
      campaignId = 0n;
    });

    it("should accept donations and update campaign totals", async function () {
      const donationAmount = ethers.parseEther("1.5");
      await expect(
        kindLedger.connect(donor1).donate(campaignId, "Alice", "Keep up the great work!", {
          value: donationAmount,
        })
      )
        .to.emit(kindLedger, "DonationReceived")
        .withArgs(campaignId, donor1.address, donationAmount, (val) => val > 0n, "Alice", "Keep up the great work!");

      const campaign = await kindLedger.getCampaign(campaignId);
      expect(campaign.totalDonated).to.equal(donationAmount);
      expect(campaign.totalReleased).to.equal(0n);
      expect(await kindLedger.getRemainingBalance(campaignId)).to.equal(donationAmount);

      const donations = await kindLedger.getDonations(campaignId);
      expect(donations.length).to.equal(1);
      expect(donations[0].donor).to.equal(donor1.address);
      expect(donations[0].amount).to.equal(donationAmount);
      expect(donations[0].donorNickname).to.equal("Alice");
    });

    it("should allow anonymous donation fallback nickname", async function () {
      await kindLedger.connect(donor2).donate(campaignId, "", "", {
        value: ethers.parseEther("0.5"),
      });
      const donations = await kindLedger.getDonations(campaignId);
      expect(donations[0].donorNickname).to.equal("Anonymous Supporter");
    });

    it("should reject zero ETH donation", async function () {
      await expect(
        kindLedger.connect(donor1).donate(campaignId, "Bob", "Test", { value: 0 })
      ).to.be.revertedWith("KindLedger: Donation amount must be greater than zero");
    });
  });

  describe("Fund Release & Payouts", function () {
    let campaignId;
    const goal = ethers.parseEther("10.0");

    beforeEach(async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 10;
      await kindLedger.connect(organizer).createCampaign(
        "Hospital Medical Supplies",
        "Urgent sterile masks and PPE.",
        "Healthcare",
        "",
        goal,
        deadline
      );
      campaignId = 0n;

      // Donate 4 ETH
      await kindLedger.connect(donor1).donate(campaignId, "Alice", "", {
        value: ethers.parseEther("4.0"),
      });
    });

    it("should allow organizer to release funds and send ETH to recipient", async function () {
      const initialRecipientBal = await ethers.provider.getBalance(recipient.address);
      const payoutAmount = ethers.parseEther("2.5");
      const purpose = "Purchased 500 batches of PPE gear from MedSupply Corp";

      const tx = await kindLedger.connect(organizer).releaseFunds(
        campaignId,
        recipient.address,
        payoutAmount,
        purpose
      );
      await tx.wait();

      const finalRecipientBal = await ethers.provider.getBalance(recipient.address);
      expect(finalRecipientBal - initialRecipientBal).to.equal(payoutAmount);

      const campaign = await kindLedger.getCampaign(campaignId);
      expect(campaign.totalReleased).to.equal(payoutAmount);
      expect(await kindLedger.getRemainingBalance(campaignId)).to.equal(ethers.parseEther("1.5"));

      const payouts = await kindLedger.getPayouts(campaignId);
      expect(payouts.length).to.equal(1);
      expect(payouts[0].recipient).to.equal(recipient.address);
      expect(payouts[0].amount).to.equal(payoutAmount);
      expect(payouts[0].purpose).to.equal(purpose);
    });

    it("should reject unauthorized callers attempting to release funds", async function () {
      await expect(
        kindLedger.connect(donor1).releaseFunds(
          campaignId,
          recipient.address,
          ethers.parseEther("1.0"),
          "Unauthorized attempt"
        )
      ).to.be.revertedWith("KindLedger: Only the campaign organizer can perform this action");
    });

    it("should reject payout exceeding remaining balance", async function () {
      await expect(
        kindLedger.connect(organizer).releaseFunds(
          campaignId,
          recipient.address,
          ethers.parseEther("5.0"), // Only 4.0 available
          "Too much"
        )
      ).to.be.revertedWith("KindLedger: Release amount exceeds available campaign balance");
    });

    it("should reject payout with zero amount or empty purpose", async function () {
      await expect(
        kindLedger.connect(organizer).releaseFunds(
          campaignId,
          recipient.address,
          0,
          "Valid purpose"
        )
      ).to.be.revertedWith("KindLedger: Release amount must be greater than zero");

      await expect(
        kindLedger.connect(organizer).releaseFunds(
          campaignId,
          recipient.address,
          ethers.parseEther("1.0"),
          ""
        )
      ).to.be.revertedWith("KindLedger: Purpose of expenditure is required");
    });
  });
});
