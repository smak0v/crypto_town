// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";

import "../utils/PieRoles.sol";

contract Pie is ERC20Capped, PieRoles {
    event PiesBaked(address indexed baker, uint8 amount);
    event PiesDestroyed(address indexed baker, uint8 amount);
    event KitchenClosed(uint256 indexed timestamp);
    event KitchenOpened(uint256 indexed timestamp);

    struct BakerInfo {
        uint256 timestamp;
        uint8 amount;
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

    modifier approvedForWorkWithPies(uint8 amount)
    {
        if (bakersInfo[_msgSender()].timestamp + 1 hours <= now) {
            bakersInfo[_msgSender()].timestamp = now;
            bakersInfo[_msgSender()].amount = 0;
        }

        require(
            bakersInfo[_msgSender()].amount + amount <= 4,
            "Pie: you can bake or destroy only 4 Pies in an hour"
        );

        _;
    }

    function bakePies(uint8 amount)
        external
        onlyBaker
        onlyOnOpenedKitchen
        approvedForWorkWithPies(amount)
        returns (bool)
    {
        _mint(_msgSender(), amount);

        bakersInfo[_msgSender()].amount += amount;

        emit PiesBaked(_msgSender(), amount);

        return true;
    }

    function destroyPies(uint8 amount)
        external
        onlyBaker
        approvedForWorkWithPies(amount)
        returns (bool)
    {
        _burn(_msgSender(), amount);

        bakersInfo[_msgSender()].amount += amount;

        emit PiesDestroyed(_msgSender(), amount);

        return true;
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
