require("truffle-test-utils").init();

const truffleAssert = require("truffle-assertions");
const { BN, expectRevert, constants } = require("@openzeppelin/test-helpers");
const Pie = artifacts.require("Pie");
const Laboratory = artifacts.require("Laboratory");
const Temple = artifacts.require("Temple");
const Land = artifacts.require("Land");

contract("Land", (accounts) => {
  const [bob, alice] = accounts;

  beforeEach(async () => {
    pie = await Pie.new();
    laboratory = await Laboratory.new();
    temple = await Temple.new(pie.address);
    land = await Land.new(laboratory.address, temple.address);
  });

  it("ensure that initial variables are correct", async () => {
    assert.equal(
      "1000000000000000000000",
      new BN(await land.priceInGold({ from: bob })).toString()
    );
    assert.equal(
      "300000000000000000000",
      new BN(await land.priceInWood({ from: bob })).toString()
    );
    assert.equal(
      "200000000000000000000",
      new BN(await land.priceInRock({ from: bob })).toString()
    );

    let price = await land.methods["priceInGoldAndSilver()"]();

    assert.equal(new BN(price[0]).toString(), "100000000000000000000");
    assert.equal(new BN(price[1]).toString(), "2000000000000000000000");
    assert.equal(temple.address, await land.temple({ from: bob }));
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
      land.setPriceInGoldAndSilver(1, 1, { from: alice }),
      "Ownable: caller is not the owner"
    );
    await expectRevert(
      land.setPriceInGold(1, { from: alice }),
      "Ownable: caller is not the owner"
    );
    await expectRevert(
      land.setPriceInWood(1, { from: alice }),
      "Ownable: caller is not the owner"
    );
    await expectRevert(
      land.setPriceInRock(1, { from: alice }),
      "Ownable: caller is not the owner"
    );
  });

  it("ensure that owner can set up only correct prices for lands", async () => {
    await expectRevert(
      land.setPriceInGoldAndSilver(0, 1, { from: bob }),
      "Land: new price must be greater than 0"
    );
    await expectRevert(
      land.setPriceInGoldAndSilver(1, 0, { from: bob }),
      "Land: new price must be greater than 0"
    );
    await expectRevert(
      land.setPriceInGold(0, { from: bob }),
      "Land: new price must be greater than 0"
    );
    await expectRevert(
      land.setPriceInWood(0, { from: bob }),
      "Land: new price must be greater than 0"
    );
    await expectRevert(
      land.setPriceInRock(0, { from: bob }),
      "Land: new price must be greater than 0"
    );
  });

  it("ensure that new price setting works correctly", async () => {
    await land.setPriceInGoldAndSilver(100, 2000, { from: bob });
    await land.setPriceInGold(500, { from: bob });
    await land.setPriceInWood(40000, { from: bob });
    await land.setPriceInRock(9999999, { from: bob });

    let price = await land.methods["priceInGoldAndSilver()"]();

    assert.equal(new BN(price[0]).toString(), "100");
    assert.equal(new BN(price[1]).toString(), "2000");
    assert.equal(
      "500",
      new BN(await land.priceInGold({ from: bob })).toString()
    );
    assert.equal(
      "40000",
      new BN(await land.priceInWood({ from: bob })).toString()
    );
    assert.equal(
      "9999999",
      new BN(await land.priceInRock({ from: bob })).toString()
    );
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

  it("ensure that land can be bought using wood", async () => {
    await laboratory.addResources(
      3,
      new BN("600000000000000000000"),
      web3.utils.fromAscii(""),
      alice,
      { from: bob }
    );
    await laboratory.setApprovalForAll(land.address, true, { from: alice });

    let tx = await land.buyUsingWood("https://google.com/", { from: alice });

    truffleAssert.eventEmitted(tx, "LandBought", (event) => {
      return event.owner == alice && event.landId == 1;
    });

    assert.equal(
      "300000000000000000000",
      new BN(await laboratory.balanceOf(alice, 3, { from: alice })).toString()
    );

    tx = await land.buyUsingWood("https://google.com/", { from: alice });

    truffleAssert.eventEmitted(tx, "LandBought", (event) => {
      return event.owner == alice && event.landId == 2;
    });

    await laboratory.setApprovalForAll(land.address, false, { from: alice });

    assert.equal(
      "0",
      new BN(await laboratory.balanceOf(alice, 3, { from: alice })).toString()
    );
  });

  it("ensure that land can be bought using rock", async () => {
    await laboratory.addResources(
      4,
      new BN("200000000000000000000"),
      web3.utils.fromAscii(""),
      alice,
      { from: bob }
    );
    await laboratory.setApprovalForAll(land.address, true, { from: alice });

    let tx = await land.buyUsingRock("https://google.com/", { from: alice });

    truffleAssert.eventEmitted(tx, "LandBought", (event) => {
      return event.owner == alice && event.landId == 1;
    });

    await laboratory.setApprovalForAll(land.address, false, { from: alice });

    assert.equal(
      "0",
      new BN(await laboratory.balanceOf(alice, 4, { from: alice })).toString()
    );
  });

  it("ensure that land can be bought using gold and silcer", async () => {
    await laboratory.addBatchOfResources(
      [0, 1],
      [new BN("100000000000000000000"), new BN("2000000000000000000000")],
      web3.utils.fromAscii(""),
      alice,
      { from: bob }
    );
    await laboratory.setApprovalForAll(land.address, true, { from: alice });

    let tx = await land.buyUsingGoldAndSilver("https://google.com/", {
      from: alice,
    });

    truffleAssert.eventEmitted(tx, "LandBought", (event) => {
      return event.owner == alice && event.landId == 1;
    });

    await laboratory.setApprovalForAll(land.address, false, { from: alice });

    assert.equal(
      "0",
      new BN(await laboratory.balanceOf(alice, 0, { from: alice })).toString()
    );
    assert.equal(
      "0",
      new BN(await laboratory.balanceOf(alice, 1, { from: alice })).toString()
    );
  });
});
