// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

// Owner == Monarch
contract Laboratory is ERC1155, Ownable {
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant METAL = 2;
    uint256 public constant WOOD = 3;
    uint256 public constant ROCK = 4;

    event AddedNewResources(
        address indexed owner,
        uint256[] ids,
        uint256[] amounts,
        bytes data
    );

    constructor()
        public
        ERC1155(
            "https://github.com/smak0v/crypto_town/erc1155/metadata/{id}.json"
        )
    {
        _mint(_msgSender(), GOLD, 1e3 * 1e18, "");
        _mint(_msgSender(), SILVER, 8e3 * 1e18, "");
        _mint(_msgSender(), METAL, 2e10 * 1e18, "");
        _mint(_msgSender(), WOOD, 7e12 * 1e18, "");
        _mint(_msgSender(), ROCK, 33e14 * 1e18, "");
    }

    function addResources(
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external onlyOwner returns (bool) {
        _mint(_msgSender(), id, amount, data);

        emit AddedNewResources(
            _msgSender(),
            _to1ElementArray(id),
            _to1ElementArray(amount),
            data
        );

        return true;
    }

    function addBatchOfResources(
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external onlyOwner returns (bool) {
        _mintBatch(_msgSender(), ids, amounts, data);

        emit AddedNewResources(_msgSender(), ids, amounts, data);

        return true;
    }

    function _to1ElementArray(uint256 element)
        private
        pure
        returns (uint256[] memory)
    {
        uint256[] memory array = new uint256[](1);

        array[0] = element;

        return array;
    }
}
