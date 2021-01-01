// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

abstract contract IPie is IERC20 {
    function isClosedKitchen() external virtual returns (bool);

    function bakePies(uint8 amount) external virtual returns (bool);

    function destroyPies(uint8 amount) external virtual returns (bool);

    function closeKitchen() external virtual returns (bool);

    function openKitchen() external virtual returns (bool);

    function decimals() external virtual returns (uint256);

    function safePieTransfer(address recipient, uint256 amount)
        external
        virtual
        returns (bool);
}
