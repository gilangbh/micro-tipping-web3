// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CreatorRegistry is Ownable {
    struct RegisteredIp {
        address creatorAddress; // The address of the creator who registered the IP
        string ipName;          // A human-readable name for the IP
        string ipMetadataUrl;   // Link to off-chain metadata for more details
        bool isVerified;        // Status set by an admin/owner
        uint256 creationTimestamp;
    }

    uint256 private nextIpIdCounter; // Counter for generating unique ipId parts

    mapping(bytes32 => RegisteredIp) public ipIdToDetails;
    mapping(address => bytes32[]) public creatorToIpIds;
    mapping(bytes32 => bool) public ipIdExists;

    event IpRegistered(
        address indexed creator,
        bytes32 indexed ipId,
        string ipName,
        string ipMetadataUrl,
        uint256 creationTimestamp
    );
    event IpMetadataUpdated(bytes32 indexed ipId, string newIpMetadataUrl);
    event IpVerificationStatusChanged(bytes32 indexed ipId, bool isVerified);

    constructor() Ownable(msg.sender) {}

    function _generateIpId(address _creator) internal returns (bytes32) {
        bytes32 newIpId = keccak256(
            abi.encodePacked(_creator, nextIpIdCounter, block.timestamp)
        );
        nextIpIdCounter++;
        return newIpId;
    }

    function registerIp(
        string calldata _ipName,
        string calldata _ipMetadataUrl
    ) external returns (bytes32) {
        require(bytes(_ipName).length > 0, "IP name cannot be empty");
        require(
            bytes(_ipMetadataUrl).length > 0,
            "IP metadata URL cannot be empty"
        );

        bytes32 ipId = _generateIpId(msg.sender);
        require(!ipIdExists[ipId], "Generated IP ID already exists, try again"); // Extremely unlikely but good practice

        RegisteredIp memory newIp = RegisteredIp({
            creatorAddress: msg.sender,
            ipName: _ipName,
            ipMetadataUrl: _ipMetadataUrl,
            isVerified: false,
            creationTimestamp: block.timestamp
        });

        ipIdToDetails[ipId] = newIp;
        creatorToIpIds[msg.sender].push(ipId);
        ipIdExists[ipId] = true;

        emit IpRegistered(
            msg.sender,
            ipId,
            _ipName,
            _ipMetadataUrl,
            block.timestamp
        );
        return ipId;
    }

    function updateIpMetadata(
        bytes32 _ipId,
        string calldata _newIpMetadataUrl
    ) external {
        require(ipIdExists[_ipId], "IP ID does not exist");
        require(
            ipIdToDetails[_ipId].creatorAddress == msg.sender,
            "Only the IP creator can update metadata"
        );
        require(
            bytes(_newIpMetadataUrl).length > 0,
            "New IP metadata URL cannot be empty"
        );

        ipIdToDetails[_ipId].ipMetadataUrl = _newIpMetadataUrl;
        emit IpMetadataUpdated(_ipId, _newIpMetadataUrl);
    }

    function setIpVerificationStatus(
        bytes32 _ipId,
        bool _isVerified
    ) external onlyOwner {
        require(ipIdExists[_ipId], "IP ID does not exist");

        ipIdToDetails[_ipId].isVerified = _isVerified;
        emit IpVerificationStatusChanged(_ipId, _isVerified);
    }

    function getIpDetails(
        bytes32 _ipId
    ) external view returns (RegisteredIp memory) {
        require(ipIdExists[_ipId], "IP ID does not exist");
        return ipIdToDetails[_ipId];
    }

    function getCreatorIpList(
        address _creator
    ) external view returns (bytes32[] memory) {
        return creatorToIpIds[_creator];
    }

    function getCreatorIpCount(address _creator) external view returns (uint256) {
        return creatorToIpIds[_creator].length;
    }

    // Function to allow owner to withdraw any accidentally sent ETH/tokens
    // (though not strictly necessary for this contract's core logic)
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // In case ERC20 tokens are accidentally sent to this contract
    function withdrawToken(address _tokenContract, uint256 _amount) external onlyOwner {
        require(_tokenContract != address(0), "Invalid token address");
        // This is a basic ERC20 transfer, assuming the contract has tokens.
        // For a robust solution, import IERC20 and use safeTransfer.
        (bool success, ) = _tokenContract.call(abi.encodeWithSignature("transfer(address,uint256)", owner(), _amount));
        require(success, "Token transfer failed");
    }
} 