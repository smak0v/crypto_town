// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";

import "../utils/PieRoles.sol";

contract Pie is ERC20Capped, PieRoles {
    event PiesBaked(address indexed baker, uint8 amount);
    event PiesDestroyed(address indexed baker, uint8 amount);
    event KitchenClosed(uint256 indexed timestamp);
    event KitchenOpened(uint256 indexed timestamp);

    struct BakerInfo {
        uint256 lastBakedPieTimestamp;
        uint256 lastDestroyedPieTimestamp;
        uint8 bakedPiesCountForLastHour;
        uint8 destroyedPiesCountForLastHour;
    }

    mapping(address => BakerInfo) public bakersInfo;

    bool public isClosedKitchen;

    constructor()
        ERC20("Pie", "PIE")
        ERC20Capped(1000 * 1e18)
        PieRoles(_msgSender())
        public
    { }

    modifier onlyOnOpenedKitchen()
    {
        require(!isClosedKitchen, "Pie: kitchen must be opened");
        _;
    }

    modifier approvedForBakingPies(uint8 amount)
    {
        require(
            bakersInfo[_msgSender()].bakedPiesCountForLastHour + amount <= 4
                || bakersInfo[_msgSender()].lastBakedPieTimestamp + 1 hours <= now,
            "Pie: you can bake only 4 Pies in an hour"
        );
        _;
    }

    modifier approvedForDestroyingPies(uint8 amount)
    {
        require(
            bakersInfo[_msgSender()].destroyedPiesCountForLastHour + amount <= 4
                || bakersInfo[_msgSender()].lastDestroyedPieTimestamp + 1 hours <= now,
            "Pie: you can destroy only 4 Pies in an hour"
        );
        _;
    }

    function bakePies(uint8 amount)
        external
        onlyBaker
        onlyOnOpenedKitchen
        approvedForBakingPies(amount)
        returns (bool)
    {
        _mint(_msgSender(), amount);

        if (bakersInfo[_msgSender()].lastBakedPieTimestamp + 1 hours <= now) {
            bakersInfo[_msgSender()].bakedPiesCountForLastHour = amount;
        } else {
            bakersInfo[_msgSender()].bakedPiesCountForLastHour += amount;
        }

        bakersInfo[_msgSender()].lastBakedPieTimestamp = now;

        emit PiesBaked(_msgSender(), amount);
    }

    function destroyPies(uint8 amount)
        external
        onlyBaker
        approvedForDestroyingPies(amount)
        returns (bool)
    {
        if (bakersInfo[_msgSender()].lastDestroyedPieTimestamp + 1 hours <= now) {
            bakersInfo[_msgSender()].destroyedPiesCountForLastHour = amount;
        } else {
            bakersInfo[_msgSender()].destroyedPiesCountForLastHour += amount;
        }

        bakersInfo[_msgSender()].lastDestroyedPieTimestamp = now;

        emit PiesDestroyed(_msgSender(), amount);
    }

    function closeKitchen()
        external
        onlyChef
        returns (bool)
    {
        if (!isClosedKitchen) {
            isClosedKitchen = true;

            emit KitchenClosed(now);
        }

        return true;
    }

    function openKitchen()
        external
        onlyChef
        returns (bool)
    {
        if (isClosedKitchen) {
            isClosedKitchen = false;

            emit KitchenOpened(now);
        }

        return true;
    }
}
