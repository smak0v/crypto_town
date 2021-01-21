// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/GSN/Context.sol";

contract Bakery is Context {
    using SafeMath for uint256;

    IERC20 token;

    uint256 public totalLiquidity;

    mapping(address => uint256) public liquidity;

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }

    function init(uint256 tokens) external payable returns (uint256) {
        require(totalLiquidity == 0, "Bakery: already has liquidity");

        totalLiquidity = address(this).balance;
        liquidity[_msgSender()] = totalLiquidity;
        token.transferFrom(_msgSender(), address(this), tokens);

        return totalLiquidity;
    }
}
