// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.9;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DADBridgeWrapper is AccessControl, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ROLE_ADMIN = keccak256("ROLE_ADMIN");

    IERC20 private immutable _token;

    uint256 private _totalSupply;

    /**
     * @dev initializes the contract
     */
    constructor(IERC20 tokenAddr) {
        require(address(tokenAddr) != address(0), "ERR_INVALID_TOKEN");
        _token = tokenAddr;
        _setRoleAdmin(ROLE_ADMIN, ROLE_ADMIN);
        _setupRole(ROLE_ADMIN, msg.sender);
    }

    /**
     * @dev returns the token contract address
     */
    function token() public view returns (IERC20) {
        return _token;
    }

    /**
     * @dev returns the total amount of tokens minted
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev pauses minting
     *
     * requirements:
     *
     * - the caller must have the ROLE_ADMIN privileges
     */
    function pause() external onlyRole(ROLE_ADMIN) {
        _pause();
    }

    /**
     * @dev unpauses minting
     *
     * requirements:
     *
     * - the caller must have the ROLE_ADMIN privileges
     */
    function unpause() external onlyRole(ROLE_ADMIN) {
        _unpause();
    }

    /**
     * @dev mints a given amount of tokens for a given recipient
     *
     * requirements:
     *
     * - the caller must have the ROLE_ADMIN privileges, and the contract must not be paused
     */
    function mint(address recipient, uint256 amount) external onlyRole(ROLE_ADMIN) whenNotPaused {
        require(recipient != address(0), "ERR_INVALID_RECIPIENT");
        require(amount > 0, "ERR_INVALID_AMOUNT");
        _token.safeTransfer(recipient, amount);
        _totalSupply += amount;
    }

    function burn(address recipient, uint256 amount) external pure {
        recipient;
        amount;
        revert("ERR_UNSUPPORTED_OPERATION");
    }
}
