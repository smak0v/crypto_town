// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "../interfaces/ILaboratory.sol";

contract Land is ERC721, Ownable {
    using SafeMath for uint256;

    struct PriceInGoldAndSilver {
        uint256 priceInGold;
        uint256 priceInSilver;
    }

    address public laboratory;
    address public temple;

    PriceInGoldAndSilver public priceInGoldAndSilver;
    uint256 public priceInGold;
    uint256 public priceInWood;
    uint256 public priceInRock;

    uint256 public amountOfLands;

    constructor(address lab, address church)
        ERC721("Land", "LAND")
        public
    {
        laboratory = lab;
        temple = church;

        priceInGoldAndSilver = PriceInGoldAndSilver({
            priceInGold: 100 * 1e18,
            priceInSilver: 2000 * 1e18
        });

        priceInGold = 1000 * 1e18;
        priceInWood = 300 * 1e18;
        priceInRock = 200 * 1e18;
    }

    modifier onlyCorrectNewPrice(uint256 newPrice)
    {
        require(newPrice > 0, "Land: new price must be greater than 0");
        _;
    }

    function setLaboratoryAddress(address newLab)
        external
        onlyOwner
        returns (bool)
    {
        require(newLab != address(0), "Land: laboratory can not be zero address");
        require(newLab != _msgSender(), "Land: laboratory can not be the same as owner");
        require(newLab != laboratory, "Land: laboratory can not be the same as old laboratory");

        laboratory = newLab;

        return true;
    }

    function setPriceInGoldAndSilver(uint256 newGoldPrice, uint256 newSilverPrice)
        external
        onlyOwner
        onlyCorrectNewPrice(newGoldPrice)
        onlyCorrectNewPrice(newSilverPrice)
    {
        priceInGoldAndSilver.priceInGold = newGoldPrice;
        priceInGoldAndSilver.priceInSilver = newSilverPrice;
    }

    function setPriceInGold(uint256 newPrice)
        external
        onlyOwner
        onlyCorrectNewPrice(newPrice)
    {
        priceInGold = newPrice;
    }

    function setPriceInWood(uint256 newPrice)
        external
        onlyOwner
        onlyCorrectNewPrice(newPrice)
    {
        priceInWood = newPrice;
    }

    function setPriceInRock(uint256 newPrice)
        external
        onlyOwner
        onlyCorrectNewPrice(newPrice)
    {
        priceInRock = newPrice;
    }

    function buyUsingGold(string memory URI)
        external
        returns (bool)
    {
        ILaboratory lab = ILaboratory(laboratory);

        return _buyLandWithOneResource(lab.GOLD(), priceInWood, URI, lab);
    }

    function buyUsingGoldAndSilver(string memory URI)
        external
        returns (bool)
    {
        ILaboratory lab = ILaboratory(laboratory);

        return _buyLandWithSomeResources(
            _to2ElementsArray(lab.GOLD(), lab.SILVER()),
            _to2ElementsArray(
                priceInGoldAndSilver.priceInGold,
                priceInGoldAndSilver.priceInSilver
            ),
            URI,
            lab
        );
    }

    function buyUsingWood(string memory URI)
        external
        returns (bool)
    {
        ILaboratory lab = ILaboratory(laboratory);

        return _buyLandWithOneResource(lab.WOOD(), priceInWood, URI, lab);
    }

    function buyUsingRock(string memory URI)
        external
        returns (bool)
    {
        ILaboratory lab = ILaboratory(laboratory);

        return _buyLandWithOneResource(lab.ROCK(), priceInRock, URI, lab);
    }

    function _buyLandWithOneResource(
        uint256 resource,
        uint256 resourceAmount,
        string memory landURI,
        ILaboratory lab
    )
        private
        returns (bool)
    {
        lab.safeTransferFrom(
            _msgSender(),
            address(this),
            resource,
            resourceAmount,
            ""
        );
        _safeMint(_msgSender(), amountOfLands.add(1));
        amountOfLands = amountOfLands.add(1);
        _setTokenURI(amountOfLands, landURI);

        return true;
    }

    function _buyLandWithSomeResources(
        uint256[] memory resources,
        uint256[] memory resourcesAmounts,
        string memory landURI,
        ILaboratory lab
    )
        private
        returns (bool)
    {
        lab.safeBatchTransferFrom(
            _msgSender(),
            address(this),
            resources,
            resourcesAmounts,
            ""
        );
        _safeMint(_msgSender(), amountOfLands.add(1));
        amountOfLands = amountOfLands.add(1);
        _setTokenURI(amountOfLands, landURI);

        return true;
    }

    function _to2ElementsArray(uint256 element1, uint256 element2)
        private
        pure
        returns (uint256[] memory)
    {
        uint256[] memory array = new uint256[](2);

        array[0] = element1;
        array[1] = element2;

        return array;
    }
}
