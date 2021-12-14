const EvmosID = artifacts.require("./EvmosID.sol");
const fs = require('fs')

module.exports = async(deployer, network) => {

    await deployer.deploy(EvmosID);
    const contract = await EvmosID.deployed();

    let configs = JSON.parse(fs.readFileSync('./configs/' + network + '.json').toString())
    console.log('Saving address in config file..')
    configs.contract_address = contract.address
    fs.writeFileSync('./configs/' + network + '.json', JSON.stringify(configs, null, 4))
    console.log('--')

};