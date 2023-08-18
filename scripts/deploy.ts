// Importing the 'writeFileSync' function from the 'fs' module to write data to a file.
import { writeFileSync } from 'fs'

// Importing the 'MarketplaceApp' contract from the specified path.
import { MarketplaceApp } from '../src/contracts/marketplaceApp'

// Importing the 'privateKey' which is presumably used for signing transactions.
import { privateKey } from './privateKey'

// Importing necessary modules and functions from 'scrypt-ts' for blockchain operations.
import { bsv, TestWallet, DefaultProvider, sha256 } from 'scrypt-ts'

// Function to compute the script hash from a given script's hexadecimal representation.
// This hash is useful for identifying and referencing the script on the blockchain.
function getScriptHash(scriptPubKeyHex: string) {
    const res = sha256(scriptPubKeyHex).match(/.{2}/g)
    if(!res) {
        // Throwing an error if the provided hex string is not of even length.
        // This ensures data consistency and correctness.
        throw new Error('scriptPubKeyHex is not of even length')
    }
    // Reversing the byte order to get the correct hash representation.
    return res.reverse().join('')
}

// The main function where the contract deployment logic resides.
async function main() {
    // Compiling the 'MarketplaceApp' contract to ensure it's ready for deployment.
    await MarketplaceApp.compile()
    
    // Preparing a signer using the imported private key.
    // The signer is responsible for signing transactions, proving ownership of the contract.
    // Changing the network to 'mainnet' would deploy the contract on the Bitcoin main network instead of the test network.
    const signer = new TestWallet(privateKey, new DefaultProvider({
        network: bsv.Networks.testnet
    }))

    const amount = 1

    // Creating a new instance of the 'MarketplaceApp' contract.
    const instance = new MarketplaceApp()

    // Connecting the contract instance to the signer.
    // This step is crucial as it allows the contract to be signed and deployed by the signer.
    await instance.connect(signer)
    
    // Deploying the contract to the blockchain with the specified amount.
    // This step broadcasts the contract to the network.
    const deployTx = await instance.deploy(amount)

    // Computing the script hash of the deployed contract.
    // This hash can be used to reference and interact with the contract in future transactions.
    const scriptHash = getScriptHash(instance.lockingScript.toHex())
    
    // Saving the script hash to a file for future reference.
    // This ensures that we can easily access and interact with our deployed contract later.
    const shFile = `.scriptHash`;
    writeFileSync(shFile, scriptHash);

    // Logging the success message and details of the deployed contract.
    console.log('MarketplaceApp contract was successfully deployed!')
    console.log(`TXID: ${deployTx.id}`)
    console.log(`scriptHash: ${scriptHash}`)
}

// Invoking the main function to execute the contract deployment.
main()
