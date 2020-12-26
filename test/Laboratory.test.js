require("truffle-test-utils").init();

const truffleAssert = require("truffle-assertions");
const { BN, expectRevert } = require("@openzeppelin/test-helpers");
const Laboratory = artifacts.require("Laboratory");

contract("Laboratory", (accounts) => {
  const [bob, alice] = accounts;

  beforeEach(async () => {
    laboratory = await Laboratory.new();
  });

  it("ensure that Monarch's initial balances are correct", async () => {
    assert.equal(
      new BN("1000000000000000000000").toString(),
      new BN(await laboratory.balanceOf(bob, 0, { from: bob })).toString()
    );
    assert.equal(
      new BN("8000000000000000000000").toString(),
      new BN(await laboratory.balanceOf(bob, 1, { from: bob })).toString()
    );
    assert.equal(
      new BN("20000000000000000000000000000").toString(),
      new BN(await laboratory.balanceOf(bob, 2, { from: bob })).toString()
    );
    assert.equal(
      new BN("7000000000000000000000000000000").toString(),
      new BN(await laboratory.balanceOf(bob, 3, { from: bob })).toString()
    );
    assert.equal(
      new BN("3300000000000000000000000000000000").toString(),
      new BN(await laboratory.balanceOf(bob, 4, { from: bob })).toString()
    );
  });

  it("ensure that URI is correct", async () => {
    assert.equal(
      "https://github.com/smak0v/crypto_town/erc1155/metadata/{id}.json",
      await laboratory.uri(0)
    );
  });

  it("ensure that only Monarch (owner) can add new resources", async () => {
    await expectRevert(
      laboratory.addResources(0, new BN("1000000"), web3.utils.fromAscii(""), {
        from: alice,
      }),
      "Ownable: caller is not the owner"
    );

    await expectRevert(
      laboratory.addBatchOfResources(
        [0, 2, 3],
        [new BN("1000000"), new BN("1000000"), new BN("1000000")],
        web3.utils.fromAscii(""),
        { from: alice }
      ),
      "Ownable: caller is not the owner"
    );
  });

  it("ensure that add resources works correctly", async () => {
    let tx = await laboratory.addResources(
      0,
      new BN("1000000000000000000000"),
      web3.utils.fromAscii(""),
      { from: bob }
    );

    truffleAssert.eventEmitted(tx, "AddedNewResources", (event) => {
      return (
        event.owner == bob &&
        event.ids == 0 &&
        event.amounts == 1000000000000000000000 &&
        event.data == "0x00"
      );
    });

    assert.equal(
      new BN("2000000000000000000000").toString(),
      new BN(await laboratory.balanceOf(bob, 0, { from: bob })).toString()
    );

    await laboratory.addResources(4, new BN("1"), web3.utils.fromAscii(""), {
      from: bob,
    });

    assert.equal(
      new BN("3300000000000000000000000000000001").toString(),
      new BN(await laboratory.balanceOf(bob, 4, { from: bob })).toString()
    );
  });

  it("ensure that adding bath of resources works correctly", async () => {
    let tx = await laboratory.addBatchOfResources(
      [0, 2, 3],
      [new BN("1000000000000000000000"), new BN("1"), new BN("200")],
      web3.utils.fromAscii(""),
      { from: bob }
    );

    truffleAssert.eventEmitted(tx, "AddedNewResources", (event) => {
      return (
        event.owner == bob && event.ids == 0,
        2,
        3 && event.amounts == 1000000000000000000000,
        1,
        200 && event.data == "0x00"
      );
    });

    assert.equal(
      new BN("2000000000000000000000").toString(),
      new BN(await laboratory.balanceOf(bob, 0, { from: bob })).toString()
    );
    assert.equal(
      new BN("20000000000000000000000000001").toString(),
      new BN(await laboratory.balanceOf(bob, 2, { from: bob })).toString()
    );
    assert.equal(
      new BN("7000000000000000000000000000200").toString(),
      new BN(await laboratory.balanceOf(bob, 3, { from: bob })).toString()
    );
  });
});
