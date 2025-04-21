// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ReentrancyGuard.sol";

contract DiskSpaceRental is ReentrancyGuard {
    // --- EVENTS ---
    event ContractDeployed(address indexed deployer);
    event StorageListed(address indexed provider, uint256 pricePerDay, uint256 sizeInGB);
    event StorageUnlisted(address indexed provider, uint256 storageId);
    event StorageRented(address indexed renter, address indexed provider, uint256 storageId, uint256 rentalDays, uint256 endTime, string cid);
    event RentalEnded(address indexed renter, uint256 storageId, bool refunded);
    event CIDUpdated(address indexed renter, uint256 storageId, string cid);
    event FundsWithdrawn(address indexed provider, uint256 amount);
    event ProviderRated(address indexed provider, uint8 rating);
    event RefundIssued(address indexed renter, uint256 storageId, uint256 amount);
    event ProfileUpdated(address indexed user);

    // --- STRUCTS ---
    struct Storage {
        address provider;
        uint256 pricePerDay;
        uint256 sizeInGB;
        bool isAvailable;
    }

    struct Rental {
        address provider;
        uint256 storageId;
        uint256 endTime;
        uint256 escrowAmount;
        string cid;
    }

    struct EncryptedProfile {
        string encryptedData;
    }

    // --- STATE ---
    mapping(address => Storage[]) public storageProviders;
    mapping(address => Rental[]) public rentals;
    mapping(address => uint256) public providerBalances;
    mapping(address => uint256) public providerRatings;
    mapping(address => uint256) public totalReviews;
    mapping(address => EncryptedProfile) private profiles;

    address[] public allProviders;
    uint256 public basePricePerGB = 0.01 ether;

    constructor() {
        emit ContractDeployed(msg.sender);
    }

    // --- PROFILE FUNCTIONS ---
    function updateEncryptedProfile(string memory _encryptedData) external {
        profiles[msg.sender].encryptedData = _encryptedData;
        emit ProfileUpdated(msg.sender);
    }

    function getEncryptedProfile(address _user) external view returns (string memory) {
        return profiles[_user].encryptedData;
    }

    // --- STORAGE LISTING ---
    function listStorage(uint256 _pricePerDay, uint256 _sizeInGB) external {
        require(_sizeInGB > 0, "Size must be greater than zero");
        require(_pricePerDay > 0, "Price must be greater than zero");

        if (storageProviders[msg.sender].length == 0) {
            allProviders.push(msg.sender);
        }

        storageProviders[msg.sender].push(Storage({
            provider: msg.sender,
            pricePerDay: _pricePerDay,
            sizeInGB: _sizeInGB,
            isAvailable: true
        }));

        emit StorageListed(msg.sender, _pricePerDay, _sizeInGB);
    }

    function getAllAvailableStorage()
        external
        view
        returns (
            address[] memory providers,
            uint256[] memory storageIds,
            uint256[] memory prices,
            uint256[] memory sizes
        )
    {
        uint256 count;

        for (uint256 i = 0; i < allProviders.length; i++) {
            Storage[] memory listings = storageProviders[allProviders[i]];
            for (uint256 j = 0; j < listings.length; j++) {
                if (listings[j].isAvailable) count++;
            }
        }

        providers = new address[](count);
        storageIds = new uint256[](count);
        prices = new uint256[](count);
        sizes = new uint256[](count);

        uint256 index;
        for (uint256 i = 0; i < allProviders.length; i++) {
            address provider = allProviders[i];
            Storage[] memory listings = storageProviders[provider];
            for (uint256 j = 0; j < listings.length; j++) {
                if (listings[j].isAvailable) {
                    providers[index] = provider;
                    storageIds[index] = j;
                    prices[index] = listings[j].pricePerDay;
                    sizes[index] = listings[j].sizeInGB;
                    index++;
                }
            }
        }
    }

    function unlistStorage(uint256 _storageId) external {
        require(_storageId < storageProviders[msg.sender].length, "Invalid storage ID");
        storageProviders[msg.sender][_storageId] = storageProviders[msg.sender][storageProviders[msg.sender].length - 1];
        storageProviders[msg.sender].pop();
        emit StorageUnlisted(msg.sender, _storageId);
    }

    function getMyListings(address _provider) external view returns (Storage[] memory) {
        return storageProviders[_provider];
    }

    function getTotalListings(address _provider) external view returns (uint256) {
        return storageProviders[_provider].length;
    }

    // --- RENTING ---
    function rentStorage(address _provider, uint256 _storageId, uint256 _rentalDays, string memory _cid) external payable nonReentrant {
        require(_storageId < storageProviders[_provider].length, "Invalid storage ID");
        Storage storage providerStorage = storageProviders[_provider][_storageId];

        require(providerStorage.isAvailable, "Storage not available");
        require(_rentalDays > 0, "Must rent for at least one day");

        uint256 totalCost = providerStorage.pricePerDay * _rentalDays;
        require(msg.value == totalCost, "Incorrect payment amount");

        uint256 rentalEndTime = block.timestamp + (_rentalDays * 1 days);

        rentals[msg.sender].push(Rental({
            provider: _provider,
            storageId: _storageId,
            endTime: rentalEndTime,
            escrowAmount: totalCost,
            cid: _cid
        }));

        providerStorage.isAvailable = false;
        providerBalances[_provider] += totalCost;

        emit StorageRented(msg.sender, _provider, _storageId, _rentalDays, rentalEndTime, _cid);
    }

    function getMyRentals(address _renter) external view returns (Rental[] memory) {
        return rentals[_renter];
    }

    function getCID(address _renter, uint256 _index) public view returns (string memory) {
        require(_index < rentals[_renter].length, "Invalid rental index");
        return rentals[_renter][_index].cid;
    }

    function updateCID(uint256 _index, string memory _cid) external {
        require(_index < rentals[msg.sender].length, "Invalid rental index");
        rentals[msg.sender][_index].cid = _cid;
        emit CIDUpdated(msg.sender, _index, _cid);
    }

    function endRental(uint256 _index) external nonReentrant {
        require(_index < rentals[msg.sender].length, "Invalid rental index");
        require(block.timestamp >= rentals[msg.sender][_index].endTime, "Rental period not over");
        rentals[msg.sender][_index] = rentals[msg.sender][rentals[msg.sender].length - 1];
        rentals[msg.sender].pop();
        emit RentalEnded(msg.sender, _index, false);
    }

    function requestRefund(uint256 _index) external nonReentrant {
        require(_index < rentals[msg.sender].length, "Invalid rental index");
        require(block.timestamp >= rentals[msg.sender][_index].endTime, "Rental period not over");

        uint256 refundAmount = rentals[msg.sender][_index].escrowAmount;
        rentals[msg.sender][_index] = rentals[msg.sender][rentals[msg.sender].length - 1];
        rentals[msg.sender].pop();
        payable(msg.sender).transfer(refundAmount);
        emit RefundIssued(msg.sender, _index, refundAmount);
    }

    function withdrawFunds() external nonReentrant {
        uint256 balance = providerBalances[msg.sender];
        require(balance > 0, "No earnings available");
        providerBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
        emit FundsWithdrawn(msg.sender, balance);
    }

    // --- RATING ---
    function rateProvider(address _provider, uint8 _rating) external {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        providerRatings[_provider] += _rating;
        totalReviews[_provider]++;
        emit ProviderRated(_provider, _rating);
    }
}