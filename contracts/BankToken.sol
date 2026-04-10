// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BankToken (BNK)
 * @dev ERC-20 token for the Decentralized Banking DApp.
 *      Initial supply: 1,000,000 BNK minted to deployer.
 *      Post-deployment, ownership is transferred to DecentralizedBank
 *      so it can mint tokens for loan issuance.
 */
contract BankToken is ERC20, Ownable {
    /**
     * @param initialSupply Number of whole tokens to mint (scaled by decimals internally)
     */
    constructor(uint256 initialSupply) ERC20("Bank Token", "BNK") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /**
     * @dev Mint new tokens — restricted to owner (DecentralizedBank contract).
     * @param to   Recipient address
     * @param amount Amount in smallest unit (wei-equivalent)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance.
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
