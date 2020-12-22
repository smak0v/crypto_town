// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract Land is ERC721 {
    constructor()
        ERC721("Land", "LAND")
        public
    { }
}
