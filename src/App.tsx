  // App.tsx
import React, { useEffect, useRef, useState } from 'react';
import ItemList from './ItemList';
import NewItem from './NewItem';
import { ScryptProvider, SensiletSigner, Scrypt, ContractCalledEvent, toByteString, MethodCallOptions, hash160 } from 'scrypt-ts';
import { Item, MarketplaceApp } from './contracts/marketplaceApp';
import Footer from './footer';
import Header from './header';  


// `npm run deploycontract` to get deployment transaction id
const contract_id = {
  /** The deployment transaction id */
  txId: "bcdf5ddd9f8bf28ab5493cd774c0aa2b4cc6267bff504c9c918603733fc7fd16",
  /** The output index */
  outputIndex: 0,
};

const App: React.FC = () => {
  const signerRef = useRef<SensiletSigner>();

  const [contractInstance, setContract] = useState<MarketplaceApp>();

  useEffect(() => {
    const provider = new ScryptProvider();
    const signer = new SensiletSigner(provider);

    signerRef.current = signer;

    fetchContract()

    const subscription = Scrypt.contractApi.subscribe(
      {
        clazz: MarketplaceApp,
        id: contract_id,
      },
      (event: ContractCalledEvent<MarketplaceApp>) => {
        setContract(event.nexts[0]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchContract() {
    try {
      const instance = await Scrypt.contractApi.getLatestInstance(
        MarketplaceApp,
        contract_id
      );
      setContract(instance)
    } catch (error: any) {
      console.error("fetchContract error: ", error);
    }
  }

  const handleBuy = async (idx: number) => {
    const signer = signerRef.current as SensiletSigner;

    if (contractInstance && signer) {
      const { isAuthenticated, error } = await signer.requestAuth();
      if (!isAuthenticated) {
        throw new Error(error);
      }

      await contractInstance.connect(signer);
      
      // Create the next instance from the current.
      const nextInstance = contractInstance.next() 
      // Set empty slot for next instance.
      nextInstance.items[idx].isEmptySlot = true

      // Bind custom contract call tx builder, that adds P2PKH output to pay
      // the sellers address.
      contractInstance.bindTxBuilder('buyItem', MarketplaceApp.buyTxBuilder)

      // Call the method of current instance to apply the updates on chain.
      contractInstance.methods
        .buyItem(
          BigInt(idx),
          {
            changeAddress: await signer.getDefaultAddress(),
            next: {
              instance: nextInstance,
              balance: contractInstance.balance,
            },
          } as MethodCallOptions<MarketplaceApp>
        )
        .then((result) => {
          console.log(`Add item call tx: ${result.tx.id}`);
        })
        .catch((e) => {
          console.error("Add item call error: ", e);
        });
    }
  };

  const handleAdd = async (newItem: { name: string; price: number }) => {
    const signer = signerRef.current as SensiletSigner;

    if (contractInstance && signer) {
      const { isAuthenticated, error } = await signer.requestAuth();
      if (!isAuthenticated) {
        throw new Error(error);
      }

      await contractInstance.connect(signer);

      // Create the next instance from the current.
      const nextInstance = contractInstance.next();

      // Construct new item object.
      const sellerAddr = hash160((await signer.getDefaultPubKey()).toString())
      const toAdd: Item = {
        name: toByteString(newItem.name, true),
        price: BigInt(newItem.price * 100 * 10 ** 6),
        sellerAddr,
        isEmptySlot: false
      }

      // Find first empty slot and insert new item.
      let itemIdx = undefined
      for (let i = 0; i < MarketplaceApp.ITEM_SLOTS; i++) {
        const item = contractInstance.items[i]
        if (item.isEmptySlot) {
          itemIdx = BigInt(i)
          nextInstance.items[i] = toAdd
          break
        }
      }

      if (itemIdx === undefined) {
        console.error('All item slots are filled.')
        return
      }

      // Call the method of current instance to apply the updates on chain.
      contractInstance.methods
        .addItem(
          toAdd,
          itemIdx,
          {
            next: {
              instance: nextInstance,
              balance: contractInstance.balance,
            },
          }
        )
        .then((result) => {
          console.log(`Add item call tx: ${result.tx.id}`);
        })
        .catch((e) => {
          console.error("Add item call error: ", e);
        });
    }
  };

  return (
    <div>
      <Header />
      <h1 className="app-title">Satofin NFT Marketplace</h1>
      <NewItem onAdd={handleAdd} />
      <ItemList items={contractInstance ? contractInstance.items as Item[] : []} onBuy={handleBuy} />
      
      <Footer />
    </div>
  );
};

export default App;