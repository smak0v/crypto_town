// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "openzeppelin-solidity/contracts/access/AccessControl.sol";
import "openzeppelin-solidity/contracts/utils/EnumerableSet.sol";

abstract contract PieRoles is AccessControl {
    using EnumerableSet for EnumerableSet.AddressSet;

    bytes32 public constant CHEF_ROLE = keccak256("CHEF_ROLE");
    bytes32 public constant BAKER_ROLE = keccak256("BAKER_ROLE");

    EnumerableSet.AddressSet bakers;

    uint8 public maxBakersCount;

    event ChefReassigned(address indexed oldChef, address indexed newChef);
    event BakerAdded(address indexed baker);
    event BakerRemoved(address indexed baker);

    constructor(address chef)
    {
        _setupRole(DEFAULT_ADMIN_ROLE, chef);
        _setupRole(CHEF_ROLE, chef);

        maxBakersCount = 3;
    }

    modifier onlyChef()
    {
        require(isChef(_msgSender()), "PieRoles: allowed only for Chef");
        _;
    }

    modifier onlyBaker()
    {
        require(isBaker(_msgSender()), "PieRoles: allowed only for Baker");
        _;
    }

    function reassignChef(address newChef)
        external
        onlyChef
    {
        require(newChef != address(0), "PieRoles: new Chef can not be zero address");
        require(newChef != _msgSender(), "PieRoles: new Chef can not be the same as old one");

        grantRole(CHEF_ROLE, newChef);
        grantRole(DEFAULT_ADMIN_ROLE, newChef);
        renounceRole(CHEF_ROLE, _msgSender());
        renounceRole(DEFAULT_ADMIN_ROLE, _msgSender());

        emit ChefReassigned(_msgSender(), newChef);
    }

    function addBaker(address account)
        external
        onlyChef
    {
        require(bakers.length() < maxBakersCount, "PieRoles: maximum number of bakers reached");

        grantRole(BAKER_ROLE, account);

        if (bakers.add(account)) {
            emit BakerAdded(account);
        }
    }

    function removeBaker(address account)
        external
        onlyChef
    {
        revokeRole(BAKER_ROLE, account);

        if (bakers.remove(account)) {
            emit BakerRemoved(account);
        }
    }

    function isChef(address account)
        public
        view
        returns (bool)
    {
        return hasRole(CHEF_ROLE, account);
    }

    function isBaker(address account)
        public
        view
        returns (bool)
    {
        return hasRole(BAKER_ROLE, account);
    }
}
