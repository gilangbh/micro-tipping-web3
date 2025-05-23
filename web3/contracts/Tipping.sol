// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "hardhat/console.sol"; // For debugging, can be removed for production

contract Tipping is Ownable {
    struct Tip {
        address from;
        address to;
        uint256 amount;
        string message; // Optional message with the tip
        uint256 timestamp;
    }

    // Event to log tips
    event TipSent(
        address indexed from,
        address indexed to,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    // Mapping to store tips for each recipient
    mapping(address => Tip[]) public tipsReceived;

    // Mapping to store total amount tipped to a recipient
    mapping(address => uint256) public totalTippedTo;

    // Optional: ERC20 token for tipping. If address(0), native currency (CAMP) is used.
    IERC20 public tippingToken;

    constructor(address _tokenAddress) Ownable(msg.sender) {
        if (_tokenAddress != address(0)) {
            tippingToken = IERC20(_tokenAddress);
        }
        // The deployer of the contract (msg.sender) is now the initial owner via Ownable(msg.sender).
    }

    /**
     * @dev Allows a user to send a tip in native currency (e.g., CAMP).
     * @param _recipient The address of the content creator to tip.
     * @param _message An optional message to send with the tip.
     */
    function tipNative(address payable _recipient, string memory _message) public payable {
        require(_recipient != address(0), "Cannot tip to the zero address");
        require(msg.value > 0, "Tip amount must be greater than 0");

        // Transfer the native currency
        (bool success, ) = _recipient.call{value: msg.value}("");
        require(success, "Native currency transfer failed");

        Tip memory newTip = Tip({
            from: msg.sender,
            to: _recipient,
            amount: msg.value,
            message: _message,
            timestamp: block.timestamp
        });

        tipsReceived[_recipient].push(newTip);
        totalTippedTo[_recipient] += msg.value;

        emit TipSent(msg.sender, _recipient, msg.value, _message, block.timestamp);
        // console.log("Native tip from %s to %s of %s", msg.sender, _recipient, msg.value);
    }

    /**
     * @dev Allows a user to send a tip in a specified ERC20 token.
     * @param _recipient The address of the content creator to tip.
     * @param _amount The amount of tokens to tip.
     * @param _message An optional message to send with the tip.
     */
    function tipToken(address _recipient, uint256 _amount, string memory _message) public {
        require(address(tippingToken) != address(0), "Tipping token not set");
        require(_recipient != address(0), "Cannot tip to the zero address");
        require(_amount > 0, "Tip amount must be greater than 0");

        uint256 allowance = tippingToken.allowance(msg.sender, address(this));
        require(allowance >= _amount, "Check token allowance");

        bool success = tippingToken.transferFrom(msg.sender, _recipient, _amount);
        require(success, "Token transfer failed");

        Tip memory newTip = Tip({
            from: msg.sender,
            to: _recipient,
            amount: _amount,
            message: _message,
            timestamp: block.timestamp
        });

        tipsReceived[_recipient].push(newTip);
        totalTippedTo[_recipient] += _amount; // Assumes token has same decimals as native for simplicity here

        emit TipSent(msg.sender, _recipient, _amount, _message, block.timestamp);
        // console.log("Token tip from %s to %s of %s", msg.sender, _recipient, _amount);
    }

    /**
     * @dev Retrieves all tips sent to a specific user.
     * @param _user The address of the user.
     * @return An array of Tips.
     */
    function getTipsForUser(address _user) public view returns (Tip[] memory) {
        return tipsReceived[_user];
    }

    /**
     * @dev Sets or changes the ERC20 token used for tipping. Only callable by the owner.
     * @param _tokenAddress The address of the ERC20 token. Set to address(0) to disable token tipping and use native only.
     */
    function setTippingToken(address _tokenAddress) public onlyOwner {
        if (_tokenAddress == address(0)) {
            tippingToken = IERC20(address(0)); // Effectively disables token tipping if address(0)
        } else {
            tippingToken = IERC20(_tokenAddress);
        }
        // console.log("Tipping token address set to: %s", _tokenAddress);
    }

    // It's good practice to add a receive function to accept native currency sent directly to the contract
    // although in this dApp, tips are directed via the tipNative function.
    receive() external payable {
        // Optionally, handle plain native currency transfers to the contract address
        // For example, one could redirect it to the owner or a treasury
        // console.log("Received plain Ether of %s from %s", msg.value, msg.sender);
    }

    // Fallback function can also be added for completeness
    fallback() external payable {
        // Handle calls to non-existent functions, or plain Ether transfers if receive() is not defined.
        // console.log("Fallback triggered with value %s from %s", msg.value, msg.sender);
    }
} 