// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "openzeppelin-solidity/contracts/utils/EnumerableSet.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "./interfaces/IPie.sol";

contract Temple is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    // Destitutes - those how have less than 5 pies on his balance
    EnumerableSet.AddressSet destitutes;

    address public pieAddress;

    event PiesDonated(address indexed donater, uint256 amount);
    event DonatedPiesDistributed(uint256 amount);
    event DestituteAdded(address indexed destitute);
    event DestituteRemoved(address indexed destitute);

    constructor(address initPieAddress)
        public
    {
        pieAddress = initPieAddress;
    }

    function setPieAddress(address newPieAddress)
        external
        onlyOwner
        returns (bool)
    {
        require(newPieAddress != address(0), "Temple: pie token can not be zero address");
        require(newPieAddress != _msgSender(), "Temple: pie token can not be the same as owner");
        require(
            newPieAddress != pieAddress,
            "Temple: pie token can not be the same as old pie token"
        );

        pieAddress = newPieAddress;

        return true;
    }

    function distributeDonatedPies()
        external
        onlyOwner
        returns (bool)
    {
        IPie pie = IPie(pieAddress);
        uint256 balance = pie.balanceOf(address(this));

        for(uint256 i = 0; i < destitutes.length(); ++i) {
            pie.transfer(destitutes.at(i), balance / destitutes.length());

            if (pie.balanceOf(destitutes.at(i)) > 5 * pie.decimals()) {
                removeDestitute(destitutes.at(i));
            }
        }

        emit DonatedPiesDistributed(balance);

        return true;
    }

    function donatePies(uint256 amount)
        external
        returns (bool)
    {
        IPie pie = IPie(pieAddress);

        pie.transferFrom(_msgSender(), address(this), amount);

        emit PiesDonated(_msgSender(), amount);

        return true;
    }

    function addDestitute(address destitute)
        external
        onlyOwner
        returns (bool)
    {
        IPie pie = IPie(pieAddress);

        require(destitutes.length() <= 50, "Temple: cann ot help more than 50 destitutes");
        require(
            pie.balanceOf(destitute) < 5 * pie.decimals(),
            "Temple: this account does not need help now"
        );

        if (destitutes.add(destitute)) {
            emit DestituteAdded(destitute);
        }

        return true;
    }

    function removeDestitute(address destitute)
        public
        onlyOwner
        returns (bool)
    {
        if (destitutes.remove(destitute)) {
            emit DestituteRemoved(destitute);
        }

        return true;
    }
}
