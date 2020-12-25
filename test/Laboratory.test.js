require("truffle-test-utils").init();

const truffleAssert = require("truffle-assertions");
const Laboratory = artifacts.require("Laboratory");
const utils = require("./helpers/utils");

contract("Laboratory", (accounts) => {
  const [bob, alice] = accounts;

  beforeEach(async () => {
    laboratory = await Laboratory.new();
  });

  it("", async () => {});
});
