const Pie = artifacts.require("Pie");
const Laboratory = artifacts.require("Laboratory");
const Land = artifacts.require("Land");
const Temple = artifacts.require("Temple");

module.exports = function (deployer) {
  deployer.deploy(Pie).then(() => {
    return deployer.deploy(Temple, Pie.address);
  });

  deployer.deploy(Laboratory).then(() => {
    return deployer.deploy(Land, Laboratory.address, Temple.address);
  });
};
