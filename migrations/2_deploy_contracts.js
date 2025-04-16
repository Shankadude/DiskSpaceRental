const DiskSpaceRental = artifacts.require("DiskSpaceRental");

module.exports = function (deployer) {
  deployer.deploy(DiskSpaceRental);
};
