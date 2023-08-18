// Importing essential modules and functions from the 'scrypt-ts' library.
// This library provides tools for building and interacting with smart contracts on the blockchain.
import {
    method,
    prop,
    SmartContract,
    hash256,
    assert,
    ByteString,
    FixedArray,
    toByteString,
    fill,
    PubKeyHash,
    Utils,
    MethodCallOptions,
    ContractTransaction,
    bsv,
    StatefulNext
} from 'scrypt-ts'

// Define the structure of an Item. This represents a product in the marketplace.
export type Item = {
    name: ByteString        // The name of the item. Using ByteString ensures a consistent byte format suitable for blockchain operations.
    price: bigint           // The price of the item in satoshis (smallest unit of Bitcoin). Using 'bigint' allows for large precise values.
    sellerAddr: PubKeyHash  // The blockchain address of the seller. This ensures only valid addresses can be used.
    isEmptySlot: boolean    // A flag to indicate if this slot in the marketplace is empty or occupied by an item. Helps in efficient management of storage.
}

// The main class representing the marketplace smart contract.
export class MarketplaceApp extends SmartContract {

    // A constant defining the maximum number of items the marketplace can hold.
    // Changing this value would affect the storage and management of items in the contract.
    static readonly ITEM_SLOTS = 10

    // An array to hold the items. It's a fixed-size array, ensuring a consistent storage structure.
    // If this structure is changed, it might affect how items are added, retrieved, or managed.
    @prop(true)
    items: FixedArray<Item, typeof MarketplaceApp.ITEM_SLOTS>

    // The constructor initializes the smart contract.
    constructor() {
        super(...arguments)
        // Initially, all slots in the marketplace are set to empty.
        // This ensures a clean slate when the contract is first deployed.
        this.items = fill(
            {
                name: toByteString(''),
                price: 0n,
                sellerAddr: PubKeyHash(toByteString('0000000000000000000000000000000000000000')),
                isEmptySlot: true
            },
            MarketplaceApp.ITEM_SLOTS
        )
    }

    // A method to add a new item to the marketplace.
    @method()
    public addItem(item: Item, itemIdx: bigint) {
        // Ensure the chosen slot for the item is empty.
        // This prevents overwriting an existing item.
        assert(this.items[Number(itemIdx)].isEmptySlot, 'item slot not empty')
        
        // Ensure the new item is valid (i.e., it's not marked as an empty slot).
        // This prevents adding invalid items.
        assert(!item.isEmptySlot, 'new item cannot have the "isEmptySlot" flag set to true')
        
        // Ensure the item has a valid price.
        // This ensures that items have a positive value.
        assert(item.price > 0n, 'item price must be at least one satoshi')

        // Place the item in the chosen slot.
        this.items[Number(itemIdx)] = item

        // Construct the blockchain outputs for this operation.
        // This is essential for the blockchain to validate and record the operation.
        let outputs = this.buildStateOutput(this.ctx.utxo.value)
        outputs += this.buildChangeOutput()
        
        // Ensure the constructed outputs are valid.
        // This is a security measure to ensure data integrity.
        assert(hash256(outputs) == this.ctx.hashOutputs, 'hashOutputs mismatch')
    }

    // A method allowing a user to buy an item from the marketplace.
    @method()
    public buyItem(itemIdx: bigint) {
        // Retrieve the item from the specified slot.
        const item = this.items[Number(itemIdx)]

        // Mark the slot as empty since the item is being purchased.
        // This ensures the item is no longer available for purchase by others.
        this.items[Number(itemIdx)].isEmptySlot = true

        // Construct the blockchain outputs for this purchase operation.
        // This ensures the seller gets paid and the blockchain records the transaction.
        let outputs = this.buildStateOutput(this.ctx.utxo.value)
        outputs += Utils.buildPublicKeyHashOutput(item.sellerAddr, item.price)
        outputs += this.buildChangeOutput()
        
        // Ensure the constructed outputs are valid.
        // This is a security measure to ensure data integrity.
        assert(hash256(outputs) == this.ctx.hashOutputs, 'hashOutputs mismatch')
    }

    // A static method to construct a blockchain transaction for buying an item.
    // This method prepares the necessary data for the transaction without actually executing it.
    // Changing the structure or logic here would affect how buying transactions are constructed and validated.
    static buyTxBuilder(
        current: MarketplaceApp, // The current state of the marketplace.
        options: MethodCallOptions<MarketplaceApp>, // Options for the method call.
        idx: bigint, // The index of the item to buy.
    ): Promise<ContractTransaction> {
        // Retrieve the item from the specified slot.
        const item = current.items[Number(idx)]
        const next = options.next as StatefulNext<MarketplaceApp>

        // Start building the transaction.
        const unsignedTx: bsv.Transaction = new bsv.Transaction()
            // Add the current state of the contract as an input.
            .addInput(current.buildContractInput(options.fromUTXO))
            
            // Add the next state of the contract as an output.
            .addOutput(
                new bsv.Transaction.Output({
                    script: next.instance.lockingScript,
                    satoshis: next.balance,
                })
            )
            
            // Add the payment to the seller as an output.
            .addOutput(
                new bsv.Transaction.Output({
                    script: bsv.Script.fromHex(
                        Utils.buildPublicKeyHashScript(item.sellerAddr)
                    ),
                    satoshis: Number(item.price),
                })
            )

        // If there's any change left from the transaction, return it to the buyer's address.
        if (options.changeAddress) {
            unsignedTx.change(options.changeAddress)
        }

        // Return the constructed transaction.
        return Promise.resolve({
            tx: unsignedTx,
            atInputIndex: 0,
            nexts: [
                {
                    instance: next.instance,
                    atOutputIndex: 0,
                    balance: next.balance,
                },
            ],
        })
    }
}
