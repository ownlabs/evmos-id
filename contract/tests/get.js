const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs')
const contract_name = argv._[0]
const NFT_CONTRACT_ABI = require('../abi.json')

async function main() {
    try {
        const configs = JSON.parse(fs.readFileSync('./configs/' + argv._ + '.json').toString())
        const provider = new HDWalletProvider(
            configs.owner_mnemonic,
            configs.provider
        );
        const web3Instance = new web3(provider);
        const nftContract = new web3Instance.eth.Contract(
            NFT_CONTRACT_ABI,
            configs.contract_address, { gasLimit: "10000000" }
        );
        console.log('Testing registered identity..')
        console.log('--')
        const identityOfAddress = await nftContract.methods.returnAddressByName("evmos").call();
        console.log('Identity of address is:', identityOfAddress)
        const ownedByAddress = await nftContract.methods.returnOwnedByAddress(identityOfAddress).call();
        console.log('Address owns', ownedByAddress, 'identities')
        for (i = 0; i <= ownedByAddress; i++) {
            const addressOfIdentity = await nftContract.methods.returnNameByAddress(identityOfAddress, i).call();
            if (addressOfIdentity !== "") {
                console.log('Address of identity is:', addressOfIdentity)
            }
        }
        process.exit();
    } catch (e) {
        console.log(e.message)
        process.exit();
    }
}

if (argv._ !== undefined) {
    main();
} else {
    console.log('Provide a deployed contract first.')
}