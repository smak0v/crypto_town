require("truffle-test-utils").init();

const truffleAssert = require("truffle-assertions");
const {
  BN,
  expectRevert,
  constants,
  time,
} = require("@openzeppelin/test-helpers");
const Pie = artifacts.require("Pie");
const Temple = artifacts.require("Temple");

contract("Temple", (accounts) => {
  const [bob, alice] = accounts;

  beforeEach(async () => {
    pie = await Pie.new();
    temple = await Temple.new(pie.address);
  });

  it("ensure that setting new pie address works correctly", async () => {
    await expectRevert(
      temple.setPieAddress(constants.ZERO_ADDRESS, { from: alice }),
      "Ownable: caller is not the owner"
    );
    await expectRevert(
      temple.setPieAddress(constants.ZERO_ADDRESS, { from: bob }),
      "Temple: pie token can not be zero address"
    );
    await expectRevert(
      temple.setPieAddress(bob, { from: bob }),
      "Temple: pie token can not be the same as owner"
    );
    await expectRevert(
      temple.setPieAddress(pie.address, { from: bob }),
      "Temple: pie token can not be the same as old pie token"
    );
    await temple.setPieAddress(alice, { from: bob });

    assert.equal(alice, await temple.pieAddress({ from: bob }));
  });

  it("ensure that only owner can add or remove destitute", async () => {
    await expectRevert(
      temple.addDestitute(alice, { from: alice }),
      "Ownable: caller is not the owner"
    );
    await expectRevert(
      temple.removeDestitute(alice, { from: alice }),
      "Ownable: caller is not the owner"
    );
  });

  it("ensure that adding destitute works correctly", async () => {
    assert.equal(false, await temple.isDestitute(alice, { from: alice }));

    let tx = await temple.addDestitute(alice, { from: bob });

    truffleAssert.eventEmitted(tx, "DestituteAdded", (event) => {
      return event.destitute == alice;
    });

    assert.equal(true, await temple.isDestitute(alice, { from: alice }));
  });

  it("ensure that removing destitute works correctly", async () => {
    await temple.addDestitute(alice, { from: bob });

    let tx = await temple.removeDestitute(alice, { from: bob });

    truffleAssert.eventEmitted(tx, "DestituteRemoved", (event) => {
      return event.destitute == alice;
    });

    assert.equal(false, await temple.isDestitute(alice, { from: alice }));
  });

  it("ensure that person with more than 5**18 pie can't be the destitute", async () => {
    await pie.addBaker(bob, { from: bob });
    await pie.bakePies(new BN("4000000000000000000"), { from: bob });
    await time.increase(3600);
    await pie.bakePies(new BN("2000000000000000000"), { from: bob });

    await expectRevert(
      temple.addDestitute(bob, { from: bob }),
      "Temple: this account does not need help now"
    );
  });

  it("ensure that pies can be donated to the temple", async () => {
    await pie.addBaker(bob, { from: bob });
    await pie.bakePies(new BN("4000000000000000000"), { from: bob });
    await pie.approve(temple.address, new BN("4000000000000000000"), {
      from: bob,
    });

    let tx = await temple.donatePies(new BN("4000000000000000000"), {
      from: bob,
    });

    truffleAssert.eventEmitted(tx, "PiesDonated", (event) => {
      return event.donater == bob && event.amount == 4000000000000000000;
    });

    assert.equal(
      "4000000000000000000",
      new BN(await pie.balanceOf(temple.address, { from: bob })).toString()
    );
  });

  it("ensure that 0 pies can't be distibuted", async () => {
    await expectRevert(
      temple.distributeDonatedPies({ from: bob }),
      "Temple: no pies were donated yet"
    );
  });

  it("ensure that pies can be distributed corretly", async () => {
    await pie.addBaker(bob, { from: bob });
    await pie.bakePies(new BN("4000000000000000000"), { from: bob });
    await pie.approve(temple.address, new BN("4000000000000000000"), {
      from: bob,
    });
    await temple.donatePies(new BN("4000000000000000000"), { from: bob });
    await temple.addDestitute(bob, { from: bob });
    await temple.addDestitute(alice, { from: bob });

    let tx = await temple.distributeDonatedPies({ from: bob });

    truffleAssert.eventEmitted(tx, "DonatedPiesDistributed", (event) => {
      return event.amount == 4000000000000000000;
    });

    assert.equal(
      "2000000000000000000",
      new BN(await pie.balanceOf(bob, { from: bob })).toString()
    );
    assert.equal(
      "2000000000000000000",
      new BN(await pie.balanceOf(alice, { from: alice })).toString()
    );
  });

  it("ensure that destitute is removed after getting more than 5*10**18 pies", async () => {
    await pie.addBaker(bob, { from: bob });
    await pie.bakePies(new BN("4000000000000000000"), { from: bob });
    await time.increase(3600);
    await pie.bakePies(new BN("4000000000000000000"), { from: bob });
    await pie.approve(temple.address, new BN("8000000000000000000"), {
      from: bob,
    });
    await temple.donatePies(new BN("8000000000000000000"), { from: bob });
    await temple.addDestitute(alice, { from: bob });

    assert.equal(true, await temple.isDestitute(alice, { from: alice }));

    await temple.distributeDonatedPies({ from: bob });

    assert.equal(false, await temple.isDestitute(alice, { from: alice }));

    assert.equal(
      "8000000000000000000",
      new BN(await pie.balanceOf(alice, { from: alice })).toString()
    );
  });
});
