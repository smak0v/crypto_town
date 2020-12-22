const Pie = artifacts.require("Pie");
const Laboratory = artifacts.require("Laboratory");
const Land = artifacts.require("Land");

module.exports = function (deployer) {
  deployer.deploy(Pie);
  deployer.deploy(Laboratory);
  deployer.deploy(Land);
};
