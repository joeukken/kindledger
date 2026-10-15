// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KindLedger: Transparent Charity Donations
 * @dev Smart contract for creating verifiable charity campaigns, accepting public donations,
 *      and transparently distributing funds to verified recipients with declared purposes.
 *
 * Designed for college/educational demonstration on a local Ethereum network (Hardhat).
 * Not audited for production use. No real funds should ever be used.
 */
contract KindLedger is ReentrancyGuard {
    // --- Data Structures ---

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        string donorNickname;
        string message;
    }

    struct Payout {
        address recipient;
        uint256 amount;
        uint256 timestamp;
        string purpose;
    }

    struct Campaign {
        uint256 id;
        string title;
        string description;
        string category;
        string imageUrl;
        uint256 goal;
        uint256 deadline;
        address payable organizer;
        uint256 totalDonated;
        uint256 totalReleased;
        bool exists;
    }

    // --- State Variables ---

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation[]) private _campaignDonations;
    mapping(uint256 => Payout[]) private _campaignPayouts;

    // --- Events ---

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed organizer,
        string title,
        string category,
        uint256 goal,
        uint256 deadline
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 timestamp,
        string donorNickname,
        string message
    );

    event FundsReleased(
        uint256 indexed campaignId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp,
        string purpose
    );

    // --- Modifiers ---

    modifier campaignExists(uint256 campaignId) {
        require(campaigns[campaignId].exists, "KindLedger: Campaign does not exist");
        _;
    }

    modifier onlyOrganizer(uint256 campaignId) {
        require(
            msg.sender == campaigns[campaignId].organizer,
            "KindLedger: Only the campaign organizer can perform this action"
        );
        _;
    }

    // --- Core Functions ---

    /**
     * @notice Creates a new charity fundraising campaign.
     * @param title Title of the campaign (1-100 characters)
     * @param description Detailed mission description
     * @param category Category tag (e.g., Medical, Disaster Relief, Education)
     * @param imageUrl Banner image URL or placeholder
     * @param goal Target funding amount in wei
     * @param deadline Unix timestamp for the fundraising deadline
     * @return campaignId The unique ID of the created campaign
     */
    function createCampaign(
        string calldata title,
        string calldata description,
        string calldata category,
        string calldata imageUrl,
        uint256 goal,
        uint256 deadline
    ) external returns (uint256) {
        require(bytes(title).length > 0 && bytes(title).length <= 120, "KindLedger: Invalid title length");
        require(bytes(description).length > 0, "KindLedger: Description required");
        require(goal > 0, "KindLedger: Fundraising goal must be greater than zero");
        require(deadline > block.timestamp, "KindLedger: Deadline must be in the future");

        uint256 newId = campaignCount;
        campaignCount++;

        campaigns[newId] = Campaign({
            id: newId,
            title: title,
            description: description,
            category: bytes(category).length > 0 ? category : "General Charity",
            imageUrl: imageUrl,
            goal: goal,
            deadline: deadline,
            organizer: payable(msg.sender),
            totalDonated: 0,
            totalReleased: 0,
            exists: true
        });

        emit CampaignCreated(newId, msg.sender, title, category, goal, deadline);
        return newId;
    }

    /**
     * @notice Donates native ETH to an active campaign.
     * @dev Follows checks-effects-interactions and is protected by nonReentrant.
     * @param campaignId ID of target campaign
     * @param donorNickname Display name or "Anonymous"
     * @param message Optional message of support
     */
    function donate(
        uint256 campaignId,
        string calldata donorNickname,
        string calldata message
    ) external payable nonReentrant campaignExists(campaignId) {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.value > 0, "KindLedger: Donation amount must be greater than zero");
        require(block.timestamp <= campaign.deadline, "KindLedger: Campaign deadline has passed");

        // Checks and state updates before external actions
        campaign.totalDonated += msg.value;

        string memory chosenNickname = bytes(donorNickname).length > 0 ? donorNickname : "Anonymous Supporter";

        _campaignDonations[campaignId].push(
            Donation({
                donor: msg.sender,
                amount: msg.value,
                timestamp: block.timestamp,
                donorNickname: chosenNickname,
                message: message
            })
        );

        emit DonationReceived(
            campaignId,
            msg.sender,
            msg.value,
            block.timestamp,
            chosenNickname,
            message
        );
    }

    /**
     * @notice Releases available campaign funds to a recipient for a specific stated purpose.
     * @dev Only callable by the campaign organizer. Follows checks-effects-interactions.
     * @param campaignId ID of the campaign
     * @param recipient Target address to receive the funds
     * @param amount Amount in wei to release
     * @param purpose Detailed explanation of what these funds will pay for
     */
    function releaseFunds(
        uint256 campaignId,
        address payable recipient,
        uint256 amount,
        string calldata purpose
    ) external nonReentrant campaignExists(campaignId) onlyOrganizer(campaignId) {
        Campaign storage campaign = campaigns[campaignId];

        require(recipient != address(0), "KindLedger: Invalid recipient address");
        require(amount > 0, "KindLedger: Release amount must be greater than zero");
        require(bytes(purpose).length > 0, "KindLedger: Purpose of expenditure is required");

        uint256 remainingBalance = campaign.totalDonated - campaign.totalReleased;
        require(amount <= remainingBalance, "KindLedger: Release amount exceeds available campaign balance");

        // Effects: Update state BEFORE sending ETH
        campaign.totalReleased += amount;

        _campaignPayouts[campaignId].push(
            Payout({
                recipient: recipient,
                amount: amount,
                timestamp: block.timestamp,
                purpose: purpose
            })
        );

        // Interaction: Send ETH
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "KindLedger: Failed to transfer funds to recipient");

        emit FundsReleased(campaignId, recipient, amount, block.timestamp, purpose);
    }

    // --- View Functions ---

    /**
     * @notice Returns remaining spendable balance for a campaign.
     */
    function getRemainingBalance(uint256 campaignId) external view campaignExists(campaignId) returns (uint256) {
        return campaigns[campaignId].totalDonated - campaigns[campaignId].totalReleased;
    }

    /**
     * @notice Returns all donations for a given campaign.
     */
    function getDonations(uint256 campaignId) external view campaignExists(campaignId) returns (Donation[] memory) {
        return _campaignDonations[campaignId];
    }

    /**
     * @notice Returns all payouts for a given campaign.
     */
    function getPayouts(uint256 campaignId) external view campaignExists(campaignId) returns (Payout[] memory) {
        return _campaignPayouts[campaignId];
    }

    /**
     * @notice Returns single campaign details.
     */
    function getCampaign(uint256 campaignId) external view campaignExists(campaignId) returns (Campaign memory) {
        return campaigns[campaignId];
    }

    /**
     * @notice Returns all campaigns in a single call to optimize frontend queries.
     */
    function getAllCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory allList = new Campaign[](campaignCount);
        for (uint256 i = 0; i < campaignCount; i++) {
            allList[i] = campaigns[i];
        }
        return allList;
    }
}
