const HDWalletProvider = require("@truffle/hdwallet-provider");
const web3 = require("web3");
require('dotenv').config()
const NFT_CONTRACT_ABI = require('../abi.json')
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs')
const configs = JSON.parse(fs.readFileSync('./configs/' + argv._ + '.json').toString())

async function main(minter) {
    if (configs.owner_mnemonic !== undefined) {
        const provider = new HDWalletProvider(
            configs.owner_mnemonic,
            configs.provider
        );
        const web3Instance = new web3(provider);
        const nftContract = new web3Instance.eth.Contract(
            NFT_CONTRACT_ABI,
            configs.contract_address, { gasLimit: "5000000" }
        );
        const gasPrice = await web3Instance.eth.getGasPrice()
        console.log('Gas price is:', gasPrice)
        try {
            const nonce = await web3Instance.eth.getTransactionCount(configs.owner_address)
            console.log('Trying registering ID with nonce ' + nonce + '...')
            const result = await nftContract.methods
                .setIdentity("evmos")
                .send({ from: configs.owner_address, nonce: nonce, gasPrice: gasPrice }).on('transactionHash', pending => {
                    console.log('Pending transaction at ' + pending)
                });
            console.log("ID registered! Transaction: " + result.transactionHash);
        } catch (e) {
            console.log(e)
        }
    } else {
        console.log('Please provide `owner_mnemonic` first.')
    }

}

if (argv._ !== undefined) {
    main();
} else {
    console.log('Provide a deployed contract first.')
}