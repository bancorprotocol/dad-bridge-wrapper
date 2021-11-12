// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.9;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DADBridgeWrapper is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant ROLE_ADMIN = keccak256("ROLE_ADMIN");

    IERC20 public immutable token;

    uint256 public totalSupply;

    constructor(IERC20 _token) {
        token = _token;
        _setRoleAdmin(ROLE_ADMIN, ROLE_ADMIN);
        _setupRole(ROLE_ADMIN, msg.sender);
    }

    function mint(address recipient, uint256 amount) external onlyRole(ROLE_ADMIN) {
        require(recipient != address(0), "ERR_INVALID_RECIPIENT");
        require(amount > 0, "ERR_INVALID_AMOUNT");
        token.safeTransfer(recipient, amount);
        totalSupply += amount;
    }

    function burn(address recipient, uint256 amount) external pure {
        recipient;
        amount;
        revert("ERR_UNSUPPORTED_OPERATION");
    }
}
