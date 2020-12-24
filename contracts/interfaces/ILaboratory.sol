// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC1155/IERC1155.sol";

abstract contract ILaboratory is IERC1155 {
    function GOLD()
        external
        virtual
        returns (uint256);

    function SILVER()
        external
        virtual
        returns (uint256);

    function METAL()
        external
        virtual
        returns (uint256);

    function WOOD()
        external
        virtual
        returns (uint256);

    function ROCK()
        external
        virtual
        returns (uint256);

    function addResources(uint256 id, uint256 amount, bytes memory data)
        external
        virtual
        returns (bool);

    function addBatchOfResources(uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        external
        virtual
        returns (bool);
}
