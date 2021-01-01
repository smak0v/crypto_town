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
      "1000000000000000000000",
      new BN(await laboratory.balanceOf(bob, 0, { from: bob })).toString()
    );
    assert.equal(
      "8000000000000000000000",
      new BN(await laboratory.balanceOf(bob, 1, { from: bob })).toString()
    );
    assert.equal(
      "20000000000000000000000000000",
      new BN(await laboratory.balanceOf(bob, 2, { from: bob })).toString()
    );
    assert.equal(
      "7000000000000000000000000000000",
      new BN(await laboratory.balanceOf(bob, 3, { from: bob })).toString()
    );
    assert.equal(
      "3300000000000000000000000000000000",
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
      laboratory.addResources(
        0,
        new BN("1000000"),
        web3.utils.fromAscii(""),
        alice,
        {
          from: alice,
        }
      ),
      "Ownable: caller is not the owner"
    );

    await expectRevert(
      laboratory.addBatchOfResources(
        [0, 2, 3],
        [new BN("1000000"), new BN("1000000"), new BN("1000000")],
        web3.utils.fromAscii(""),
        alice,
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
      alice,
      { from: bob }
    );

    truffleAssert.eventEmitted(tx, "AddedNewResources", (event) => {
      return (
        event.monarch == bob &&
        event.recipient == alice &&
        event.ids == 0 &&
        event.amounts == 1000000000000000000000 &&
        event.data == "0x00"
      );
    });

    assert.equal(
      "1000000000000000000000",
      new BN(await laboratory.balanceOf(alice, 0, { from: alice })).toString()
    );

    await laboratory.addResources(
      4,
      new BN("1"),
      web3.utils.fromAscii(""),
      alice,
      {
        from: bob,
      }
    );

    assert.equal(
      "1",
      new BN(await laboratory.balanceOf(alice, 4, { from: alice })).toString()
    );
  });

  it("ensure that adding bath of resources works correctly", async () => {
    let tx = await laboratory.addBatchOfResources(
      [0, 2, 3],
      [new BN("1000000000000000000000"), new BN("1"), new BN("200")],
      web3.utils.fromAscii(""),
      alice,
      { from: bob }
    );

    truffleAssert.eventEmitted(tx, "AddedNewResources", (event) => {
      return (
        event.monarch == bob && event.recipient == alice && event.ids == 0,
        2,
        3 && event.amounts == 1000000000000000000000,
        1,
        200 && event.data == "0x00"
      );
    });

    assert.equal(
      "1000000000000000000000",
      new BN(await laboratory.balanceOf(alice, 0, { from: alice })).toString()
    );
    assert.equal(
      "1",
      new BN(await laboratory.balanceOf(alice, 2, { from: alice })).toString()
    );
    assert.equal(
      "200",
      new BN(await laboratory.balanceOf(alice, 3, { from: alice })).toString()
    );
  });
});
