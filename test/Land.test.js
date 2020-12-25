require("truffle-test-utils").init();

const truffleAssert = require("truffle-assertions");
const Pie = artifacts.require("Pie");
const Laboratory = artifacts.require("Laboratory");
const Temple = artifacts.require("Temple");
const Land = artifacts.require("Land");
const utils = require("./helpers/utils");

contract("Land", (accounts) => {
  const [bob, alice] = accounts;

  beforeEach(async () => {
    pie = await Pie.new();
    laboratory = await Laboratory.new();
    temple = await Temple.new(pie.address);
    land = await Land.new(laboratory.address, temple.address);
  });

  it("", async () => {});
});
