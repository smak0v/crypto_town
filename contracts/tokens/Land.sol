// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "openzeppelin-solidity/contracts/token/ERC1155/IERC1155Receiver.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "../interfaces/ILaboratory.sol";

contract Land is ERC721, Ownable, IERC1155Receiver {
    using SafeMath for uint256;

    struct PriceInGoldWoodAndRock {
        uint256 priceInGold;
        uint256 priceInWood;
        uint256 priceInRock;
    }

    struct PriceInSilverWoodAndRock {
        uint256 priceInSilver;
        uint256 priceInWood;
        uint256 priceInRock;
    }

    address public laboratory;

    PriceInGoldWoodAndRock public priceInGoldWoodAndRock;
    PriceInSilverWoodAndRock public priceInSilverWoodAndRock;
    uint256 public priceInGold;

    uint256 public amountOfLands;

    event LandBought(address indexed owner, uint256 landId);

    constructor(address lab) ERC721("Land", "LAND") {
        laboratory = lab;

        priceInGoldWoodAndRock = PriceInGoldWoodAndRock({
            priceInGold: 100 * 1e18,
            priceInWood: 300 * 1e18,
            priceInRock: 200 * 1e18
        });
        priceInSilverWoodAndRock = PriceInSilverWoodAndRock({
            priceInSilver: 2000 * 1e18,
            priceInWood: 300 * 1e18,
            priceInRock: 200 * 1e18
        });
        priceInGold = 1000 * 1e18;
    }

    modifier onlyCorrectNewPrice(uint256 newPrice) {
        require(newPrice > 0, "Land: new price must be greater than 0");
        _;
    }

    function setLaboratoryAddress(address newLab)
        external
        onlyOwner
        returns (bool)
    {
        require(
            newLab != address(0),
            "Land: laboratory can not be zero address"
        );
        require(
            newLab != _msgSender(),
            "Land: laboratory can not be the same as owner"
        );
        require(
            newLab != laboratory,
            "Land: laboratory can not be the same as old laboratory"
        );

        laboratory = newLab;

        return true;
    }

    function setPriceInGold(uint256 newPrice)
        external
        onlyOwner
        onlyCorrectNewPrice(newPrice)
    {
        priceInGold = newPrice;
    }

    function setPriceInGoldWoodAndRock(
        uint256 newGoldPrice,
        uint256 newWoodPrice,
        uint256 newRockPrice
    )
        external
        onlyOwner
        onlyCorrectNewPrice(newGoldPrice)
        onlyCorrectNewPrice(newWoodPrice)
        onlyCorrectNewPrice(newRockPrice)
    {
        priceInGoldWoodAndRock.priceInGold = newGoldPrice;
        priceInGoldWoodAndRock.priceInWood = newWoodPrice;
        priceInGoldWoodAndRock.priceInRock = newRockPrice;
    }

    function setPriceInSilverWoodAndRock(
        uint256 newSilverPrice,
        uint256 newWoodPrice,
        uint256 newRockPrice
    )
        external
        onlyOwner
        onlyCorrectNewPrice(newSilverPrice)
        onlyCorrectNewPrice(newWoodPrice)
        onlyCorrectNewPrice(newRockPrice)
    {
        priceInSilverWoodAndRock.priceInSilver = newSilverPrice;
        priceInSilverWoodAndRock.priceInWood = newWoodPrice;
        priceInSilverWoodAndRock.priceInRock = newRockPrice;
    }

    function buyUsingGold(string memory URI) external returns (bool) {
        ILaboratory lab = ILaboratory(laboratory);

        return _buyLandWithOneResource(lab.GOLD(), priceInGold, URI, lab);
    }

    function buyUsingGoldWoodAndRock(string memory URI)
        external
        returns (bool)
    {
        ILaboratory lab = ILaboratory(laboratory);

        return
            _buyLandWithSomeResources(
                _to3ElementsArray(lab.GOLD(), lab.WOOD(), lab.ROCK()),
                _to3ElementsArray(
                    priceInGoldWoodAndRock.priceInGold,
                    priceInGoldWoodAndRock.priceInWood,
                    priceInGoldWoodAndRock.priceInRock
                ),
                URI,
                lab
            );
    }

    function buyUsingSilverWoodAndRock(string memory URI)
        external
        returns (bool)
    {
        ILaboratory lab = ILaboratory(laboratory);

        return
            _buyLandWithSomeResources(
                _to3ElementsArray(lab.SILVER(), lab.WOOD(), lab.ROCK()),
                _to3ElementsArray(
                    priceInSilverWoodAndRock.priceInSilver,
                    priceInSilverWoodAndRock.priceInWood,
                    priceInSilverWoodAndRock.priceInRock
                ),
                URI,
                lab
            );
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external override returns (bytes4) {
        return 0xf23a6e61;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external override returns (bytes4) {
        return 0xbc197c81;
    }

    function _buyLandWithOneResource(
        uint256 resource,
        uint256 resourceAmount,
        string memory landURI,
        ILaboratory lab
    ) private returns (bool) {
        lab.safeTransferFrom(
            _msgSender(),
            address(this),
            resource,
            resourceAmount,
            ""
        );

        return _mintLandForUser(landURI);
    }

    function _buyLandWithSomeResources(
        uint256[] memory resources,
        uint256[] memory resourcesAmounts,
        string memory landURI,
        ILaboratory lab
    ) private returns (bool) {
        lab.safeBatchTransferFrom(
            _msgSender(),
            address(this),
            resources,
            resourcesAmounts,
            ""
        );

        return _mintLandForUser(landURI);
    }

    function _mintLandForUser(string memory landURI) private returns (bool) {
        _safeMint(_msgSender(), amountOfLands.add(1));
        amountOfLands = amountOfLands.add(1);
        _setTokenURI(amountOfLands, landURI);

        emit LandBought(_msgSender(), amountOfLands);

        return true;
    }

    function _to3ElementsArray(
        uint256 element1,
        uint256 element2,
        uint256 element3
    ) private pure returns (uint256[] memory) {
        uint256[] memory array = new uint256[](3);

        array[0] = element1;
        array[1] = element2;
        array[2] = element3;

        return array;
    }
}
