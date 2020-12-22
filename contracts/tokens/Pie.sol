// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";

contract Pie is ERC20Capped {
    constructor()
        ERC20("Pie", "PIE")
        ERC20Capped(1000 * 1e18)
        public
    { }
}
