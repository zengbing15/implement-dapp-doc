---
id: transfer-tx-dapp-demo
title: Transfer-Tx DApp demo
sidebar_position: 4
---

You've understood the important data strucure: Cell, Script and Transaction, now you can start to develop some simple DApp demos now.

Maybe you have a question, could such a complex transaction code only be built manually?    
Of course not.    
[Lumos](https://github.com/nervosnetwork/lumos) is an open-source framework that was developed by the developers team from [Cryptape](https://www.cryptape.com/join) for building DApps on CKB.You can use lumos to build transactions on your own.

 The transfer-tx DApp demo is based on Lumos functionalities to implement the most basic functions. You've already experienced the RPC component of lumos on [RPC](rpc-and-transaction#RPC). In the process of the transfer-tx DApp development, you can understand more functions and utilities about lumos.

## Project Structure

The full code of the example can be found [here](https://github.com/zengbing15/simple-dapp-demo/tree/main/transfer-tx-dapp-demo), you will see the following files:

```
transfer-tx-dapp-demo
├── accounts.js
├── index.js
└── package.json
```

## Prerequisites

* See [Set Up the Development Environment](https://cryptape.github.io/lumos-doc/docs/preparation/setupsystem).
* Prepare two CKB accounts, Alice and Bob, see [Create CKB accounts](rpc-and-transaction#create-ckb-accounts). The payer is Alice and the recipient is Bob.
*  Specify Alice as the miner to receive mining rewards, see [Step 5. Get CKB capacity for the account of Alice](https://cryptape.github.io/lumos-doc/docs/reference/ckbaccount#step-5-get-ckb-capacity-for-the-account-of-alice).
* Update `accounts.js` file.

## Set up the Configuration for Lumos

### Step1: Set up the Config Manager

**Generate the config.json file for the DEV chain**    

see [Set Up the Config Manager by Using a Local Config File](https://cryptape.github.io/lumos-doc/docs/guides/config#set-up-the-config-manager-by-using-a-local-config-file).

**Set up the config manager**

Use `@ckb-lumos/config-manager`.  The config manager component (`@ckb-lumos/config-manager`) deals with differences between chains, such as the Mainnet, Testnet, or numerous DEV chains. Each chain is abstracted into an individual configuration file.
When a configuration file is loaded, the config manager processes the chain specific logic, sparing the corresponding coding work for configuration management.

```bash
$ yarn add @ckb-lumos/config-manager
```

Example usage:

```javascript
const { initializeConfig, getConfig } = require("@ckb-lumos/config-manager");
process.env.LUMOS_CONFIG_FILE = process.env.LUMOS_CONFIG_FILE || './config.json'
initializeConfig();
const CKB_CONFIG = getConfig();
```

### Step2: Set Up the Lumos Indexer

 Use `@ckb-lumos/indexer`, see [Set Up the Lumos Indexer](https://cryptape.github.io/lumos-doc/docs/guides/indexer). The Lumos indexer is a CKB cell indexer. The Lumos indexer indexes cells and maintains a local database of the cells that provides an optimal way for querying cells.

```bash
$ yarn add @ckb-lumos/indexer
```

Example usage:
```javascript
const {Indexer} = require("@ckb-lumos/indexer");
const CKB_RPC_URI = process.env.CKB_RPC_URI || "http://127.0.0.1:8114";
const CKB_INDEXER_DATA = process.env.CKB_INDEXER_DATA || "./indexer-data";
const indexer = new Indexer(CKB_RPC_URI, CKB_INDEXER_DATA);
indexer.startForever();
```

## Build the Transfer Transaction

A transaction, at its core, really just consumes some cells, and create another set of cells. As a result, the ability to locate and transform cells, plays a critical role in building any CKB dapps, which leads to the `index-query-assemble` pattern, see [Index-Query-Assemble Pattern](https://docs.nervos.org/docs/reference/cell#index-query-assemble-pattern). Lumos was designed on the basis of the `Index-Query-Assemble` pattern. The lumos indexer is already set in [Step2: Set Up the Lumos Indexer](#step2-set-up-the-lumos-indexer) , now you can query and assemble cells to build transfer transaction.


###  Step1: Create a transaction skeleton

Use [transfer](https://nervosnetwork.github.io/lumos/modules/common_scripts.html#transfer-10) in `@ckb-lumos/common-scripts` and [TransactionSkeleton](https://nervosnetwork.github.io/lumos/modules/helpers.html#transactionskeleton) in `@ckb-lumos/helpers`

The common scripts component (`@ckb-lumos/common-scripts`) integrates known scripts on CKB. The scripts use a cell provider (the Lumos indexer) to collect cells and assemble transactions. Each script implements a specific `TransactionSkeleton` for building transactions that forms a unified workflow for transaction generation.

The helpers component (`@ckb-lumos/helpers`) defines interfaces, types and utilities that require to work under a CKB network. The network, testnet or mainnet, is specified by the config manager.


```bash
$ yarn add @ckb-lumos/common-scripts
$ yarn add @ckb-lumos/helpers
```
Example usage:

```javascript {4,5,7}
const {common} = require('@ckb-lumos/common-scripts');
const {TransactionSkeleton} = require("@ckb-lumos/helpers");

const SHANNONS = BigInt(100000000);
const AMOUNT = BigInt(process.env.AMOUNT || 500)*SHANNONS;

const fromInfos = [
        ALICE.ADDRESS,
        {
        R: 0,
        M: 1,
        publicKeyHashes: [ALICE.ARGS],
    },
    ]

    let txSkeleton = TransactionSkeleton({ cellProvider: indexer });

    const tipheader = await CKB_RPC.get_tip_header();
    
    txSkeleton = await common.transfer(
        txSkeleton,
        fromInfos,
        BOB.ADDRESS,
        BigInt(AMOUNT),
        undefined,
        tipheader
    );
```

* About `AMONT`:  A cell's size is the total size of all fields contained in it,see [Cell](rpc-and-transaction#cell).A cell is required at least 61 CKBytes, otherwise, the `InsufficientCellCapacity` error will be sent.

  ```
InsufficientCellCapacity error: 
(node:82255) UnhandledPromiseRejectionWarning: Error: JSONRPCError: server error {"code":-302"message":"TransactionFailedToVerify: Verification failed Transaction(InsufficientCellCapacity
(Outputs[0]): expected occupied capacity (0x16b969d00) <= capacity (0x165a0bc00))",
"data":"Verification(Error { kind: Transaction, inner: InsufficientCellCapacity(Outputs[0]): 
expected occupied capacity (0x16b969d00) <= capacity (0x165a0bc00) })"}
  ```

* About `SHANNONS`:  The smallest unit of CKB capacity called **shannon**. 1 CKByte = 100000000 shannon 
* About `fromInfos`:  Lumos supports gathering input cells from singe or multiple accounts by using the `fromInfos` parameter,see `Constructor` section in [Transfer CKB in a Common Transaction](https://cryptape.github.io/lumos-doc/docs/guides/buildtransactions#transfer-ckb-in-a-common-transaction) The transfer transaction is used single sign case, so `R:0 M:1`.

### Step2: Add the transaction fee 

Use [payFeeByFeeRate](https://nervosnetwork.github.io/lumos/modules/common_scripts.html#payfeebyfeerate-2) in `@ckb-lumos/common-scripts` to set up the dynamic transaction fee.

Example usage:

```javascript
 const FEE_RATE = BigInt(process.env.FEE_RATE || 1000);
 txSkeleton = await common.payFeeByFeeRate(
        txSkeleton,
        fromInfos,
        FEE_RATE,
        tipheader
    );
```

### Step3: Prepare the signing entries 

Use [prepareSigningEntries](https://nervosnetwork.github.io/lumos/modules/common_scripts.html#preparesigningentries-12) in `@ckb-lumos/common-scripts` to add the signing entries to the transaction skeleton. The result is a raw transaction that requires signatures.

Example usage:

```javascript
txSkeleton = common.prepareSigningEntries(txSkeleton);
```

### Step4: Sign the transaction

 Use the [key.signRecoverable](https://nervosnetwork.github.io/lumos/modules/hd.html#signrecoverable-3) function of the HD wallet manager (`@ckb-lumos/hd`) package to generate a signature based on the private key and signing message.  

```bash
$ yarn add ckb-js-toolkit
$ yarn add ckb-lumos/hd
```

```javascript {11}
const {Reader} = require("ckb-js-toolkit");
const { key } = require("@ckb-lumos/hd");
    
const message = txSkeleton
.get("signingEntries")
.map((e) => {
const lock = txSkeleton.get("inputs").get(e.index).cell_output.lock;
return `${e.message}`
}).toArray().toString(); 
    
const hexmessage = new Reader(message).serializeJson();
const signature = key.signRecoverable(hexmessage, ALICE.PRIVATE_KEY);
```

About `Reader` class：Use [Reader class](https://github.com/nervosnetwork/ckb-js-toolkit#reader) in CKB-JS-Toolkit to transfer `message`'s format to `Hex string`.Because in the process of development on DApps you should convert values in specific formats.

### Step5: Seal the transaction

Use [sealTransaction](https://nervosnetwork.github.io/lumos/modules/helpers.html#sealtransaction) in `@ckb-lumos/helpers` to seal the transaction with `txSkeleton` and `signature`.The transaction is built.

```javascript
const {sealTransaction} = require("@ckb-lumos/helpers");
    
const tx = sealTransaction(txSkeleton, [signature]);
console.log(JSON.stringify(tx,null,2))

```

### Step6: Send the finalized transaction to the CKB network

Remember you have experienced `@ckb-lumos/rpc` in [Connect to CKB node through RPC](rpc-and-transaction#connect-to-ckb-node-through-rpc)?    
Now you can use `@ckb-lumos/rpc` to send the transaction to the CKB network.

```bash
$ yarn add @ckb-lumos/rpc
```

```javascript
const { RPC } = require("@ckb-lumos/rpc");

const CKB_RPC_URI = process.env.CKB_RPC_URI || "http://localhost:8114";
const rpc = new RPC(CKB_RPC_URI);
const hash = await rpc.send_transaction(tx);
console.log('The transaction hash is:', hash);
```

A transaction hash output example:

```json
The transaction hash is: 0xbbab8ff0e8609fca7a7bbfb8112a13027058d38b740d67db191f95ee34f3a8c1
```

### Workflow

The DApp can assemble a transaction in the following steps:
* Set up the Configuration for Lumos
    * Step1: Set up the Config Manager
    * Step2: Set up the Lumos Indexer
* Build the Transfer Transaction
    * Step1: Create a transaction skeleton
    * Step2: Add the transaction fee
    * Step3: Prepare the signing entries 
    * Step4: Sign the transaction
    * Step5: Seal the transaction
    * Step6: Send the finalized transaction to the CKB network

You have developed your first DApp demo.In the process, you have learned about almost all lumos components.     
Well done!     
For more information about lumos, see [lumos-doc](https://cryptape.github.io/lumos-doc/).

## TroubleShooting

When you generate the `config.json` file, may encounter binary execution error:

```bash
dyld: malformed mach-o image: segment __DWARF has vmsize < filesize
[1] 35570 abort ./lumos-config-generator config.json
```
The reason is that if macOS is upgraded to Catalina, there is a problem with golang execution.    
Use `go build -ldflags "-w"` to compile source code.

```bash
$ git clone https://github.com/classicalliu/lumos-config-generator.git
$ cd lumos-config-generator
$ go build -ldflags "-w" 
```

:::info

## Generation offline Validation online

DApps on CKB layer1 separate the generation and verification of state. The state can be generated offline and verified online, see [State Generation and Verification](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0002-ckb/0002-ckb.md#41-state-generation-and-verification).     

After the transaction has been built offline, the state is already determined by `outputs`. The transaction is committed online just for validating the legitimacy. That is why lumos can be used to build transactions offline.

If you know about DApps developments on Ethereum, have you found the difference between CKB and Ethereum?

On Ethereum, the transaction includes `calldata` and smart contracts.After the transaction is committed, the EVM online executes the transaction then the smart contracts are deployed and executed, then the account's data is modified and a new world state is obtained. Which means that The state should be determined after the transaction is committed.This is the essential difference between Nervos CKB and Ethereum.

But does this means Ethereum DApp developers who want to develop on CKB have to abandon their previous development habits and learn a new set of programming models and tools?    
Of course not!    
The reason will be revealed in [Stay tuned](conclusion#stay-tuned).
:::