const Pie = artifacts.require("Pie");
const Laboratory = artifacts.require("Laboratory");
const Land = artifacts.require("Land");
const Temple = artifacts.require("Temple");

module.exports = async (deployer) => {
  await deployer.deploy(Pie);
  await deployer.deploy(Temple, Pie.address);
  await deployer.deploy(Laboratory);
  await deployer.deploy(Land, Laboratory.address);

  let laboratoryInstance = await Laboratory.deployed();
  let landInstance = await Land.deployed();

  await laboratoryInstance.setApprovalForAll(Land.address, true);
  await landInstance.buyUsingGold("https://github.com/smak0v/crypto_town/erc721/metadata/temple.json");
  await laboratoryInstance.setApprovalForAll(Land.address, false);
};
