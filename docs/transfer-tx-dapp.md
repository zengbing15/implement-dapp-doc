---
id: transfer-tx-dapp-demo
title: A transfer-tx DApp demo
sidebar_position: 4
---

You've understood the important data strucure: Cell, Script and Transaction, so you can start to develop some simple DApp demos now.

But can such a complex transaction code be built manually?
Of course not.
[Lumos](https://github.com/nervosnetwork/lumos) is an open-source framework that was developed by the developers team from [Cryptape](https://www.cryptape.com/join), for building DApps on CKB.You can use lumos to build transactions on your own.

You've already experienced the RPC component of lumos on [RPC](rpc-and-transaction#RPC).
The transfer-tx DApp demo is based on Lumos functionalities to implement the most basic functions, you can understand more functions and utilities about lumos.

## Project structure



## Prerequisites

* See [Set Up the Development Environment](https://cryptape.github.io/lumos-doc/docs/preparation/setupsystem).
* Prepare two CKB accounts, Alice and Bob, that will be used in the `accounts.js` file in the later transfer-tx DApp demo example, see [Create Accounts](https://cryptape.github.io/lumos-doc/docs/preparation/createaccount). 
*  设置 Alice 作为 DevChain 的 miner to get capacity, see [Step 5. Get CKB capacity for the account of Alice](https://cryptape.github.io/lumos-doc/docs/reference/ckbaccount#step-5-get-ckb-capacity-for-the-account-of-alice) ,同时 Alice 也是转账交易的发送方，Bob 作为接收方
* 更新 accounts.js 

```
/accounts.js

const ALICE = {
    PRIVATE_KEY:`${ALICE's private_key}`,
    ADDRESS:`${ALICE's private_key}`,
    ARGS:`${ALICE's args}`
}

const BOB = {
    PRIVATE_KEY:`${BOB's private_key}`,
    ADDRESS:`${BOB's private_key}`,
    ARGS:`${BOB's args}`
}

module.exports = {
    ALICE,
    BOB,
}
```

## 

## Set up the Configuration for Lumos

### **Step1: Set up the Config Manager** 

**Generate the config.json file for the DEV chain, see[Set Up the Config Manager by Using a Local Config File](https://cryptape.github.io/lumos-doc/docs/guides/config#set-up-the-config-manager-by-using-a-local-config-file)**

**TroubleShooting:** 

macOS 升级到Catalina 10.15后，可能会遇到报错执行二进制文件报错 

```
dyld: malformed mach-o image: segment __DWARF has vmsize < filesize
[1] 35570 abort ./lumos-config-generator config.json

```

编译的时候使用 `go build -ldflags "-w"` 这种方式编译。

```
$ git clone https://github.com/classicalliu/lumos-config-generator.git
$ cd lumos-config-generator
$ go build -ldflags "-w" 
```

**Set up the config manager**

Use `@ckb-lumos/config-manager`.  The config manager component (`@ckb-lumos/config-manager`) deals with differences between chains, such as the Mainnet, Testnet, or numerous DEV chains. Each chain is abstracted into an individual configuration file.
When a configuration file is loaded, the config manager processes the chain specific logic, sparing the corresponding coding work for configuration management.

```
yarn add @ckb-lumos/config-manager
```

Example:

```
const { initializeConfig, getConfig } = require("@ckb-lumos/config-manager");
process.env.LUMOS_CONFIG_FILE = process.env.LUMOS_CONFIG_FILE || './config.json'
initializeConfig();
const CKB_CONFIG = getConfig();

```

### Step2: Set Up the Lumos Indexer

 Use `@ckb-lumos/indexer`, see [Set Up the Lumos Indexer](https://cryptape.github.io/lumos-doc/docs/guides/indexer) The Lumos indexer (`@ckb-lumos/indexer` and `@ckb-lumos/sql-indexer`) is a CKB cell indexer that fulfills the [Index-Query-Assemble](https://docs.nervos.org/docs/reference/cell#index-query-assemble-pattern) pattern. The Lumos indexer indexes cells and maintains a local database of the cells that provides an optimal way for querying cells.

```
yarn add @ckb-lumos/indexer
```

Example:

```
const {Indexer} = require("@ckb-lumos/indexer");
const CKB_RPC_URI = process.env.CKB_RPC_URI || "http://127.0.0.1:8114";
const CKB_INDEXER_DATA = process.env.CKB_INDEXER_DATA || "./indexer-data";
const indexer = new Indexer(CKB_RPC_URI, CKB_INDEXER_DATA);
indexer.startForever();

```

## Build the Transfer  Transaction

A transaction, at its core, really just consumes some cells, and create another set of cells. As a result, the ability to locate and transform cells, plays a critical role in building any CKB dapps, which leads to the `index-query-assemble` pattern, see [Index-Query-Assemble Pattern](https://docs.nervos.org/docs/reference/cell#index-query-assemble-pattern). Lumos was designed on the basis of the [Index-Query-Assemble](https://docs.nervos.org/docs/reference/cell#index-query-assemble-pattern) pattern. 在Step3 已经设置好了  lumos indexer, 现在开始 query and assemble cells to build transfer transaction.


###  Step1: Create a transaction skeleton

Use [transfer](https://nervosnetwork.github.io/lumos/modules/common_scripts.html#transfer-10) in `@ckb-lumos/common-scripts` and[TransactionSkeleton](https://nervosnetwork.github.io/lumos/modules/helpers.html#transactionskeleton) in  `@ckb-lumos/helpers`

The common scripts component (`@ckb-lumos/common-scripts`) integrates known scripts on CKB. The scripts use a cell provider (the Lumos indexer ) to collect cells and assemble transactions. Each script implements a specific `TransactionSkeleton` for building transactions that forms a unified workflow for transaction generation.

The helpers component (`@ckb-lumos/helpers`) defines interfaces, types and utilities that require to work under a CKB network. The network, testnet or mainnet, is specified by the config manager.


```
$ yarn add @ckb-lumos/common-scripts
$ yarn add @ckb-lumos/helpers
```


Example:

```
const {common} = require('@ckb-lumos/common-scripts');
const {TransactionSkeleton} = require("@ckb-lumos/helpers");

const SHANNONS = BigInt(100000000);
const AMOUNT = BigInt(process.env.AMOUNT || 500)*SHANNONS; // transfer balance

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



* About transfer balance  `AMONT:`  由于 Cell 自身的 `capacity`, `lock script`, `type script`, `data` 四个字段，本身也会占据空间，所以构建一个 Cell 最少需要 61 CKB，如果不足61 CKB 则会报错 InsufficientCellCapacity, 所以设置转账金额 `AMOUNT` 时一定不低于 61 CKB。


InsufficientCellCapacity error: 

```
(node:82255) UnhandledPromiseRejectionWarning: Error: JSONRPCError: server error {"code":-302,"message":"TransactionFailedToVerify: Verification failed Transaction(InsufficientCellCapacity(Outputs[0]): expected occupied capacity (0x16b969d00) <= capacity (0x165a0bc00))","data":"Verification(Error { kind: Transaction, inner: InsufficientCellCapacity(Outputs[0]): expected occupied capacity (0x16b969d00) <= capacity (0x165a0bc00) })"}
```



* About `SHANNONS:`  CKB capacity 的最小单位是 shannon , 1 CKB = 100000000 shannon   就像 1 bitcoin = 100000000 satoshi
* About `fromInfos:`  lumos supports gathering input cells from singe or multiple accounts as a single unit by using the `fromInfos` parameter.  see Constructor section in [Transfer CKB in a Common Transaction](https://cryptape.github.io/lumos-doc/docs/guides/buildtransactions#transfer-ckb-in-a-common-transaction) 这里处理的是单签的情况，所以  `R:0 M:1`



### Step2: Add the transaction fee 

使用 @ckb-lumos/common-scripts 中的 [payFeeByFeeRate](https://nervosnetwork.github.io/lumos/modules/common_scripts.html#payfeebyfeerate-2) ，可以输入 FEE_RATE 实现动态设置 tx_fee

```
 const FEE_RATE = BigInt(process.env.FEE_RATE || 1000);
 txSkeleton = await common.payFeeByFeeRate(
        txSkeleton,
        fromInfos,
        FEE_RATE,
        tipheader
    );
```

### Step3: Prepare the signing entries 

使用 @ckb-lumos/common-scripts 中的 [prepareSigningEntries](https://nervosnetwork.github.io/lumos/modules/common_scripts.html#preparesigningentries-12) to add the signing entries to the transaction skeleton. The result is a raw transaction that requires signatures.

```
txSkeleton = common.prepareSigningEntries(txSkeleton);
```

### Step4: Sign the transaction

 uses the [key.signRecoverable](https://nervosnetwork.github.io/lumos/modules/hd.html#signrecoverable-3) function of the HD wallet manager (@ckb-lumos/hd) package to generate a signature based on the private key and signing message.  

 CKB 中 depending on sources of data, we might get values in different formats: Hex string might be provided in CKB RPC responses ,为了把 message 转换成 hex message, 这里要用到 [Reader class](https://github.com/nervosnetwork/ckb-js-toolkit#reader) in [ckb-js-toolkit](https://github.com/nervosnetwork/ckb-js-toolkit#reader)


```
$ yarn add ckb-js-toolkit
$ yarn add ckb-lumos/hd
```

```
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

### Step5: Seal the  transaction

使用 [sealTransaction](https://nervosnetwork.github.io/lumos/modules/helpers.html#sealtransaction) @ckb-lumos/helpers 最终把生成的 signature 添加到 witness，the transaction  build 完成。

```
    const {sealTransaction} = require("@ckb-lumos/helpers");
    
    const tx = sealTransaction(txSkeleton, [signature]);
    console.log(JSON.stringify(tx,null,2))

```



### Step6: Send the finalized transaction to the CKB network

还记得我们最开始使用 @ckb-lumos/rpc 请求 blockchain info 吗？see Connect to CKB node through RPC 没错，这次用来 send the transaction  


```
$ yarn add @ckb-lumos/rpc
```

```
const { RPC } = require("@ckb-lumos/rpc");

const CKB_RPC_URI = process.env.CKB_RPC_URI || "http://localhost:8114";
const rpc = new RPC(CKB_RPC_URI);
const hash = await rpc.send_transaction(tx);
console.log('The transaction hash is:', hash);
```

A transaction hash output example:

```
The transaction hash is: 0xbbab8ff0e8609fca7a7bbfb8112a13027058d38b740d67db191f95ee34f3a8c1
```

### 总结整个 workflow ：

* Set up the Configuration for Lumos
    * Step1: Set up the Config Manager
    * Step2: Set up the Lumos Indexer
* Build the Transfer Transaction
    * Step1:Create a transaction skeleton
    * Step2: Add the transaction fee
    * Step3: Prepare the signing entries 
    * Step4: Sign the transaction
    * Step5: Seal the transaction
    * Step6: Send the finalized transaction to the CKB network

在这个过程中使用了 Lumos 的 几乎所有常用 component（packages）， see  [Lumos Components (Packages)](https://cryptape.github.io/lumos-doc/docs/introduction/lumoscomponents) , 回顾刚才的 code sample, 是不是更加理解 lumos 的功能了。


:::info

如果有对以太坊了解的朋友，是否发现了 CKB 与 以太坊 编程模型的不同之处呢？

Ethereum 的 DApps 中，交易里包含 calldata 和 smart contract，交易提交上链后，链上的 EVM 执行交易，部署并执行智能合约后，账户的合约数据进行了修改，得到一个新的world state。也就是说链上状态在 EVM 执行过交易之后才能确定。

DApps on CKB layer1 separate the generation and verification of state. The state can be generated offline and verified online, see [State Generation and Verification](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0002-ckb/0002-ckb.md#41-state-generation-and-verification). 实际上链下构建完交易之后，链上状态已经通过交易的 output 确定了，链上只是对交易的合法性进行验证，不会改变交易结果，并不像 Ethereum , 链上需要执行完交易后才能确定状态，这里是有本质区别的。

这也是 Lumos 的工作原理，因为 The state can be generated offline，所以可以先在链下通过 lumos build transactions ( Step5: Seal the  transaction- the transaction is already built. ), 最终再 send the transaction to the CKB network.

不过这是否意味着 Ethereum dApp 开发者如果想在 CKB 上开发，就必须要抛弃之前的开发习惯，学习一套新的编程模型和工具呢？
当然不是！原因会在 To be Continued 揭晓~

:::