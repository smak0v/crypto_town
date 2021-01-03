require("truffle-test-utils").init();

const truffleAssert = require("truffle-assertions");
const { time, constants, BN } = require("@openzeppelin/test-helpers");
const Pie = artifacts.require("Pie");
const utils = require("./helpers/utils");

contract("Pie", (accounts) => {
  const [bob, alice, baker1, baker2, baker3, baker4] = accounts;

  beforeEach(async () => {
    pie = await Pie.new();
  });

  it("adding bakers", async () => {
    await utils.shouldThrow(
      pie.addBaker(baker1, { from: alice }),
      "PieRoles: allowed only for Chef"
    );

    assert.equal(false, await pie.isBaker(alice, { from: alice }));

    let tx = await pie.addBaker(baker1, { from: bob });

    truffleAssert.eventEmitted(tx, "BakerAdded", (event) => {
      return event.baker == baker1;
    });

    assert.equal(true, await pie.isBaker(baker1, { from: alice }));

    await pie.addBaker(baker2, { from: bob });
    await pie.addBaker(baker3, { from: bob });
    await utils.shouldThrow(
      pie.addBaker(baker4, { from: bob }),
      "PieRoles: maximum number of bakers reached"
    );
  });

  it("removing bakers", async () => {
    assert.equal(true, await pie.isChef(bob, { from: bob }));
    assert.equal(false, await pie.isChef(alice, { from: alice }));
    assert.equal(false, await pie.isBaker(baker1, { from: baker1 }));

    await pie.addBaker(baker1, { from: bob });

    assert.equal(true, await pie.isBaker(baker1, { from: baker1 }));

    await utils.shouldThrow(
      pie.removeBaker(baker1, { from: alice }),
      "PieRoles: allowed only for Chef"
    );

    let tx = await pie.removeBaker(baker1, { from: bob });

    truffleAssert.eventEmitted(tx, "BakerRemoved", (event) => {
      return event.baker == baker1;
    });

    assert.equal(false, await pie.isBaker(baker1, { from: baker1 }));
  });

  it("reassigning Chef role", async () => {
    await utils.shouldThrow(
      pie.reassignChef(baker1, { from: alice }),
      "PieRoles: allowed only for Chef"
    );
    await utils.shouldThrow(
      pie.reassignChef(constants.ZERO_ADDRESS, { from: bob }),
      "PieRoles: new Chef can not be zero address"
    );
    await utils.shouldThrow(
      pie.reassignChef(bob, { from: bob }),
      "PieRoles: new Chef can not be the same as old one"
    );

    let tx = await pie.reassignChef(alice, { from: bob });

    truffleAssert.eventEmitted(tx, "ChefReassigned", (event) => {
      return event.oldChef == bob && event.newChef == alice;
    });

    assert.equal(true, await pie.isChef(alice, { from: alice }));
    assert.equal(false, await pie.isChef(bob, { from: bob }));

    await pie.addBaker(baker1, { from: alice });
    await utils.shouldThrow(
      pie.addBaker(baker2, { from: bob }),
      "PieRoles: allowed only for Chef"
    );
  });

  it("closing/opening of kitchen", async () => {
    await pie.addBaker(baker1, { from: bob });

    assert.equal(false, await pie.isClosedKitchen({ from: bob }));

    let tx = await pie.closeKitchen({ from: bob });

    truffleAssert.eventEmitted(tx, "KitchenClosed", (event) => {
      return true;
    });

    assert.equal(true, await pie.isClosedKitchen({ from: bob }));

    await utils.shouldThrow(
      pie.bakePies(new BN("2000000000000000000"), { from: baker1 }),
      "Pie: kitchen must be opened"
    );

    tx = await pie.openKitchen({ from: bob });

    truffleAssert.eventEmitted(tx, "KitchenOpened", (event) => {
      return true;
    });

    assert.equal(false, await pie.isClosedKitchen({ from: bob }));

    await utils.shouldThrow(
      pie.closeKitchen({ from: alice }),
      "PieRoles: allowed only for Chef"
    );
  });

  it("baking of pies", async () => {
    await utils.shouldThrow(
      pie.bakePies(new BN("2000000000000000000"), { from: baker1 }),
      "PieRoles: allowed only for Baker"
    );
    await pie.addBaker(baker1, { from: bob });

    let tx = await pie.bakePies(new BN("2000000000000000000"), {
      from: baker1,
    });

    truffleAssert.eventEmitted(tx, "PiesBaked", (event) => {
      return event.baker == baker1 && event.amount == 2000000000000000000;
    });

    assert.equal(
      "2000000000000000000",
      new BN(await pie.balanceOf(baker1, { from: baker1 })).toString()
    );

    await pie.bakePies(new BN("1300000000000000000"), { from: baker1 });

    assert.equal(
      "3300000000000000000",
      new BN(await pie.balanceOf(baker1, { from: baker1 })).toString()
    );

    await pie.bakePies(new BN("700000000000000000"), { from: baker1 });

    assert.equal(
      "4000000000000000000",
      new BN(await pie.balanceOf(baker1, { from: baker1 })).toString()
    );

    await utils.shouldThrow(
      pie.bakePies(new BN("1000000000000000000"), { from: baker1 }),
      "Pie: you can bake or destroy only 4e18 Pies in an hour"
    );
  });

  it("destroying of pies", async () => {
    await pie.addBaker(baker1, { from: bob });
    await pie.bakePies(new BN("2000000000000000000"), { from: baker1 });

    let tx = await pie.destroyPies(new BN("1000000000000000000"), {
      from: baker1,
    });

    truffleAssert.eventEmitted(tx, "PiesDestroyed", (event) => {
      return event.baker == baker1 && event.amount == 1000000000000000000;
    });

    await utils.shouldThrow(
      pie.destroyPies(new BN("2000000000000000000"), { from: baker1 }),
      "Pie: you can bake or destroy only 4e18 Pies in an hour"
    );

    assert.equal(
      "1000000000000000000",
      new BN(await pie.balanceOf(baker1, { from: baker1 })).toString()
    );

    await pie.destroyPies(new BN("1000000000000000000"), { from: baker1 });

    assert.equal(
      "0",
      new BN(await pie.balanceOf(baker1, { from: baker1 })).toString()
    );

    await utils.shouldThrow(
      pie.destroyPies(new BN("3000000000000000000"), { from: baker1 }),
      "Pie: you can bake or destroy only 4e18 Pies in an hour"
    );
  });

  it("ensure that baker can bake or destroy only 4e18 pies in an hour", async () => {
    await pie.addBaker(baker1, { from: bob });
    await pie.bakePies(new BN("4000000000000000000"), { from: baker1 });
    await utils.shouldThrow(
      pie.bakePies(new BN("1000000000000000000"), { from: baker1 }),
      "Pie: you can bake or destroy only 4e18 Pies in an hour"
    );
    await time.increase(3600);
    await pie.bakePies(new BN("4000000000000000000"), { from: baker1 });
    await time.increase(3600);
    await pie.bakePies(new BN("2000000000000000000"), { from: baker1 });
    await utils.shouldThrow(
      pie.destroyPies(new BN("3000000000000000000"), { from: baker1 }),
      "Pie: you can bake or destroy only 4e18 Pies in an hour"
    );
    await pie.bakePies(new BN("2000000000000000000"), { from: baker1 });
    await time.increase(3600);
    await pie.destroyPies(new BN("3000000000000000000"), { from: baker1 });
    await pie.bakePies(new BN("1000000000000000000"), { from: baker1 });
    await utils.shouldThrow(
      pie.destroyPies(new BN("3000000000000000000"), { from: baker1 }),
      "Pie: you can bake or destroy only 4e18 Pies in an hour"
    );
    await time.increase(1800);
    await utils.shouldThrow(
      pie.bakePies(new BN("4000000000000000000"), { from: baker1 }),
      "Pie: you can bake or destroy only 4e18 Pies in an hour"
    );
    await time.increase(1800);
    await utils.shouldThrow(
      pie.bakePies(new BN("5000000000000000000"), { from: baker1 }),
      "Pie: you can bake or destroy only 4e18 Pies in an hour"
    );
    await pie.bakePies(new BN("4000000000000000000"), { from: baker1 });
  });
});
