// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";

contract Laboratory is ERC1155 {
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant METAL = 2;
    uint256 public constant WOOD = 3;
    uint256 public constant ROCK = 4;

    constructor()
        ERC1155("https://github.com/smak0v/crypto_town/erc1155/metadata/{id}.json")
        public
    {
        _mint(_msgSender(), GOLD, 1e3 * 1e18, "");
        _mint(_msgSender(), SILVER, 8e3 * 1e18, "");
        _mint(_msgSender(), METAL, 2e10 * 1e18, "");
        _mint(_msgSender(), WOOD, 7e12 * 1e18, "");
        _mint(_msgSender(), ROCK, 33e14 * 1e18, "");
    }
}
