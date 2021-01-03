require("truffle-test-utils").init();

const truffleAssert = require("truffle-assertions");
const { BN, expectRevert, constants } = require("@openzeppelin/test-helpers");
const Pie = artifacts.require("Pie");
const Laboratory = artifacts.require("Laboratory");
const Land = artifacts.require("Land");

contract("Land", (accounts) => {
  const [bob, alice] = accounts;

  beforeEach(async () => {
    pie = await Pie.new();
    laboratory = await Laboratory.new();
    land = await Land.new(laboratory.address);
  });

  it("ensure that initial variables are correct", async () => {
    assert.equal(
      "1000000000000000000000",
      new BN(await land.priceInGold({ from: bob })).toString()
    );

    let priceInGoldWoodAndRock = await land.methods[
      "priceInGoldWoodAndRock()"
    ]();

    assert.equal(
      new BN(priceInGoldWoodAndRock[0]).toString(),
      "100000000000000000000"
    );
    assert.equal(
      new BN(priceInGoldWoodAndRock[1]).toString(),
      "300000000000000000000"
    );
    assert.equal(
      new BN(priceInGoldWoodAndRock[2]).toString(),
      "200000000000000000000"
    );

    let priceInSilverWoodAndRock = await land.methods[
      "priceInSilverWoodAndRock()"
    ]();

    assert.equal(
      new BN(priceInSilverWoodAndRock[0]).toString(),
      "2000000000000000000000"
    );
    assert.equal(
      new BN(priceInSilverWoodAndRock[1]).toString(),
      "300000000000000000000"
    );
    assert.equal(
      new BN(priceInSilverWoodAndRock[2]).toString(),
      "200000000000000000000"
    );
    assert.equal(laboratory.address, await land.laboratory({ from: bob }));
  });

  it("ensure that setting the new laboratory address works correctly", async () => {
    await expectRevert(
      land.setLaboratoryAddress(constants.ZERO_ADDRESS, { from: alice }),
      "Ownable: caller is not the owner"
    );
    await expectRevert(
      land.setLaboratoryAddress(constants.ZERO_ADDRESS, { from: bob }),
      "Land: laboratory can not be zero address"
    );
    await expectRevert(
      land.setLaboratoryAddress(bob, { from: bob }),
      "Land: laboratory can not be the same as owner"
    );
    await expectRevert(
      land.setLaboratoryAddress(laboratory.address, { from: bob }),
      "Land: laboratory can not be the same as old laboratory"
    );
    await land.setLaboratoryAddress(
      "0x9540218d02dC864B5Ba660c99709932C3F08621D",
      { from: bob }
    );

    assert.equal(
      "0x9540218d02dC864B5Ba660c99709932C3F08621D",
      await land.laboratory({ from: bob })
    );
  });

  it("ensure that only owner can set up new prices for lands", async () => {
    await expectRevert(
      land.setPriceInGold(1, { from: alice }),
      "Ownable: caller is not the owner"
    );
    await expectRevert(
      land.setPriceInGoldWoodAndRock(1, 1, 1, { from: alice }),
      "Ownable: caller is not the owner"
    );
    await expectRevert(
      land.setPriceInSilverWoodAndRock(1, 1, 1, { from: alice }),
      "Ownable: caller is not the owner"
    );
  });

  it("ensure that owner can set up only correct prices for lands", async () => {
    await expectRevert(
      land.setPriceInGold(0, { from: bob }),
      "Land: new price must be greater than 0"
    );
    await expectRevert(
      land.setPriceInGoldWoodAndRock(0, 1, 1, { from: bob }),
      "Land: new price must be greater than 0"
    );
    await expectRevert(
      land.setPriceInGoldWoodAndRock(1, 0, 1, { from: bob }),
      "Land: new price must be greater than 0"
    );
    await expectRevert(
      land.setPriceInGoldWoodAndRock(0, 1, 1, { from: bob }),
      "Land: new price must be greater than 0"
    );
    await expectRevert(
      land.setPriceInSilverWoodAndRock(0, 1, 1, { from: bob }),
      "Land: new price must be greater than 0"
    );
    await expectRevert(
      land.setPriceInSilverWoodAndRock(1, 0, 1, { from: bob }),
      "Land: new price must be greater than 0"
    );
    await expectRevert(
      land.setPriceInSilverWoodAndRock(1, 1, 0, { from: bob }),
      "Land: new price must be greater than 0"
    );
  });

  it("ensure that new price setting works correctly", async () => {
    await land.setPriceInGold(500, { from: bob });
    await land.setPriceInGoldWoodAndRock(100, 2000, 300, { from: bob });
    await land.setPriceInSilverWoodAndRock(200, 1, 999, { from: bob });

    assert.equal(
      "500",
      new BN(await land.priceInGold({ from: bob })).toString()
    );

    let priceInGoldWoodAndRock = await land.methods[
      "priceInGoldWoodAndRock()"
    ]();

    assert.equal(new BN(priceInGoldWoodAndRock[0]).toString(), "100");
    assert.equal(new BN(priceInGoldWoodAndRock[1]).toString(), "2000");
    assert.equal(new BN(priceInGoldWoodAndRock[2]).toString(), "300");

    let priceInSilverWoodAndRock = await land.methods[
      "priceInSilverWoodAndRock()"
    ]();

    assert.equal(new BN(priceInSilverWoodAndRock[0]).toString(), "200");
    assert.equal(new BN(priceInSilverWoodAndRock[1]).toString(), "1");
    assert.equal(new BN(priceInSilverWoodAndRock[2]).toString(), "999");
  });

  it("ensure that resources can be spent by operator only after allowance", async () => {
    await laboratory.addResources(
      0,
      new BN("1000000000000000000000"),
      web3.utils.fromAscii(""),
      alice,
      { from: bob }
    );

    assert.equal(
      false,
      await laboratory.isApprovedForAll(alice, land.address, { from: alice })
    );

    await expectRevert(
      land.buyUsingGold("https://google.com/", { from: alice }),
      "ERC1155: caller is not owner nor approved"
    );
    await laboratory.setApprovalForAll(land.address, true, { from: alice });

    assert.equal(
      true,
      await laboratory.isApprovedForAll(alice, land.address, { from: alice })
    );

    await land.buyUsingGold("https://google.com/", { from: alice });
    await laboratory.setApprovalForAll(land.address, false, { from: alice });

    assert.equal(
      false,
      await laboratory.isApprovedForAll(alice, land.address, { from: alice })
    );
  });

  it("ensure that land can be bought using gold", async () => {
    await laboratory.addResources(
      0,
      new BN("1000000000000000000000"),
      web3.utils.fromAscii(""),
      alice,
      { from: bob }
    );
    await laboratory.setApprovalForAll(land.address, true, { from: alice });

    let tx = await land.buyUsingGold("https://google.com/", { from: alice });

    truffleAssert.eventEmitted(tx, "LandBought", (event) => {
      return event.owner == alice && event.landId == 1;
    });

    await laboratory.setApprovalForAll(land.address, false, { from: alice });

    assert.equal(
      "0",
      new BN(await laboratory.balanceOf(alice, 0, { from: alice })).toString()
    );
  });

  it("ensure that land can be bought using gold, wood and rock", async () => {
    await laboratory.addBatchOfResources(
      [0, 3, 4],
      [
        new BN("200000000000000000000"),
        new BN("600000000000000000000"),
        new BN("400000000000000000000"),
      ],
      web3.utils.fromAscii(""),
      alice,
      { from: bob }
    );
    await laboratory.setApprovalForAll(land.address, true, { from: alice });

    let tx = await land.buyUsingGoldWoodAndRock("https://google.com/", {
      from: alice,
    });

    truffleAssert.eventEmitted(tx, "LandBought", (event) => {
      return event.owner == alice && event.landId == 1;
    });

    assert.equal(
      "100000000000000000000",
      new BN(await laboratory.balanceOf(alice, 0, { from: alice })).toString()
    );
    assert.equal(
      "300000000000000000000",
      new BN(await laboratory.balanceOf(alice, 3, { from: alice })).toString()
    );
    assert.equal(
      "200000000000000000000",
      new BN(await laboratory.balanceOf(alice, 4, { from: alice })).toString()
    );

    tx = await land.buyUsingGoldWoodAndRock("https://google.com/", {
      from: alice,
    });

    truffleAssert.eventEmitted(tx, "LandBought", (event) => {
      return event.owner == alice && event.landId == 2;
    });

    await laboratory.setApprovalForAll(land.address, false, { from: alice });

    assert.equal(
      "0",
      new BN(await laboratory.balanceOf(alice, 0, { from: alice })).toString()
    );
    assert.equal(
      "0",
      new BN(await laboratory.balanceOf(alice, 3, { from: alice })).toString()
    );
    assert.equal(
      "0",
      new BN(await laboratory.balanceOf(alice, 4, { from: alice })).toString()
    );
  });

  it("ensure that land can be bought using silver, wood and rock", async () => {
    await laboratory.addBatchOfResources(
      [1, 3, 4],
      [
        new BN("2000000000000000000000"),
        new BN("300000000000000000000"),
        new BN("200000000000000000000"),
      ],
      web3.utils.fromAscii(""),
      alice,
      { from: bob }
    );
    await laboratory.setApprovalForAll(land.address, true, { from: alice });

    let tx = await land.buyUsingSilverWoodAndRock("https://google.com/", {
      from: alice,
    });

    truffleAssert.eventEmitted(tx, "LandBought", (event) => {
      return event.owner == alice && event.landId == 1;
    });

    await laboratory.setApprovalForAll(land.address, false, { from: alice });

    assert.equal(
      "0",
      new BN(await laboratory.balanceOf(alice, 1, { from: alice })).toString()
    );
    assert.equal(
      "0",
      new BN(await laboratory.balanceOf(alice, 3, { from: alice })).toString()
    );
    assert.equal(
      "0",
      new BN(await laboratory.balanceOf(alice, 4, { from: alice })).toString()
    );
  });
});
