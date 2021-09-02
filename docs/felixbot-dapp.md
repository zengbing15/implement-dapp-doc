---
id: felix-bot
title: Felix bot DApp demo
sidebar_position: 5
---

Now you have learned the basic knowledge of DApps development on CKB layer1 with lumos. It's time to develop a slightly more complex DApp demo.    

Felix bot is a telegram bot, created by [botgram](https://github.com/botgram/botgram). You can use felix bot to interact with CKB layer1, send CKBytes red packages in a telegram chat group.In the process of the felix bot DApp development,you can more intuitively understand the interaction between the client, back-end and CKB layer1.

## Project Structure

The full code of the example can be found [here](https://github.com/zengbing15/felix). Clone the project you will see the following files:

```bash
$ git clone https://github.com/zengbing15/felix.git
$ cd felix
```

```
fix
├── lib
│   ├── data.js
│   ├── server.js
│   └── utils.js
├── schema
│   ├── UnsignedTransaction.mol
│   ├── UnsignedTransaction.json
│   ├── UnsignedTransaction.js
│   └── UnsignedTransaction.umd.js
├── package.json
├── .gitignore
└── README.md
```

## Prerequisites

### Set up the Development Environment

See [Set Up the Development Environment](https://cryptape.github.io/lumos-doc/docs/preparation/setupsystem).

### Prepare three CKB accounts

 Create three accounts: Alice, Bob and Charlie，see [Create CKB accounts](rpc-and-transaction#create-ckb-accounts). The payer is Bob and the recipient is Alice.

### Specify Alice as the miner

see [Step 5. Get CKB capacity for the account of Alice](https://cryptape.github.io/lumos-doc/docs/reference/ckbaccount#step-5-get-ckb-capacity-for-the-account-of-alice)

### Use CKB-CLI  to transfer some CKBytes to Bob

```bash
$ ckb-cli --from-account <alice lock_arg> --to-address <bob address> --capacity <transfer amount> --tx-fee <0.01(defualt value)>
```
### Set up a telegram bot

* Create a telegram bot, see [3. How do I create a bot?](https://core.telegram.org/bots#3-how-do-i-create-a-bot)
* Send a list of commands to BotFather 

```
start - start
help - help
set_receiving_address - Set receiving address
receiving_address - Get receiving address
pending_envelopes - List of pending envelopes sent by me
pay - Pay an envelope
send - send envelopes
```

## Run the felix bot

### Install dependencies

```bash
$ npm install
```

### Set up the proxy server

```bash
export https_proxy=http://127.0.0.1:10080;export http_proxy=http://127.0.0.1:10080;export all_proxy=socks5://127.0.0.1:10081
```

### Set up the BOT_TOKEN

```bash
$ export BOT_TOKEN=<BOT_TOKEN>
```

## Set up the Configuration for Lumos

The act of sending a red packet is actually transferring CKBytes, so you can set up the configure manager and indexer of lumos first.

```javascript
const { Indexer } = require("@ckb-lumos/indexer");
const { initializeConfig, getConfig } = require("@ckb-lumos/config-manager");
process.env.LUMOS_CONFIG_FILE = process.env.LUMOS_CONFIG_FILE || './config.json'
initializeConfig();
const CKB_CONFIG = getConfig();

process.env.LUMOS_CONFIG_FILE = process.env.LUMOS_CONFIG_FILE || './config.json'
initializeConfig();
const CKB_CONFIG = getConfig();

const CKB_RPC_URI = process.env.CKB_RPC_URI || "http://127.0.0.1:8114";
const CKB_INDEXER_DATA = process.env.CKB_INDEXER_DATA || "./indexer-data";
const indexer = new Indexer(CKB_RPC_URI, CKB_INDEXER_DATA);
indexer.startForever();
```
For a sender, you can 

* /send@botname  send 发红包命令, 能够 Grab 的次数，也就是所显示的 remaining：number 不超过 group chat member

[Image: image.png]
For a grabber, you can

* set your receiving address: Charlie’s address
* Grab the red package 

[Image: image.png]


## Use [parseAddress](https://nervosnetwork.github.io/lumos/modules/helpers.html#parseaddress) to confirm receiving address  

在 Address and Lock Script 部分，提到 

> 地址 packages a lock script into a single line in a verifiable and human-readable format.，"ckt" is for the testnet or devchain. 


所以使用 `parseAddress`  对输入的地址进行解析，判断是否 return `Script`  type, 如果没有，则进行提示，`CKB_CONFIG.PREFIX`表示了 the  address prefix `PREFIX` of  current running chain `CKB_CONFIG` object 


```
const {parseAddress} = require("@ckb-lumos/helpers");

  [DATA_RECEIVING_ADDRESS]: async (session, msg, reply) => {
    const address = msg.text || "";
    try {
      parseAddress(address);
    } catch (e) {
      console.log(`Error parsing address: ${e}`);
      reply.text(
        `Please use a valid CKB address that starts with ${CKB_CONFIG.PREFIX}!`
      );
      return DATA_RECEIVING_ADDRESS;
    }
    await storage.put(`address:${msg.from.id}`, address);
    reply.text(`Setting your receiving address to ${address}!`);
    return null;
  },
```

Felix 通过 grabber 的 `Grab `行为获得 grabber 的 user.id 和 address

```
  async grab(receiverId, storage) {
    if (this.remaining() <= 0) {
      throw new Error("You are too late!");
    }
    if (this.receivers.find((receiver) => receiver.id === receiverId)) {
      throw new Error("You have already grabbed one!");
    }
    let address;
    try {
      address = (await storage.get(`address:${receiverId}`)).toString();
    } catch (e) {
      throw new Error("Please click on me, and set your receiving address in a private chat!");
    }
    this.receivers.push({
      id: receiverId,
      address,
    });
  }
```


For a sender , you can 

* select a envelope to pay
* enter the CKBytes to pay for the red envelope
* enter the address used to pay for the red envelope: Bob’s address

[Image: image.png]

## Build the transaction skeleton


这时候已经获取到了转账所需的足够的信息（交易双方地址，转账金额），并且查找到需要转账给 Grab 红包的人的 `currentAmount` ,然后就按步骤 build txSkeleton：


* Create a transaction skeleton
* Add the transaction fee
* Prepare the signing entries 

```
let txSkeleton = TransactionSkeleton({ cellProvider: indexer });
    const fromInfos = [fromAddress]

......

      txSkeleton = await common.transfer(
        txSkeleton,
        fromInfos,
        receiver.address,
        currentAmount + BigInt(61) * SHANNONS,
      );
    }
    
       // use `payFeeByFeeRate` to set dynamic tx fee
    txSkeleton = await common.payFeeByFeeRate(
      txSkeleton, 
      fromInfos, 
      FEE_RATE,
      );
    txSkeleton = common.prepareSigningEntries(txSkeleton);
   
```



之后 felix bot reply `message` in signingEntries object 

[Image: image.png]


```
    ......
    const signingInfos = txSkeleton
      .get("signingEntries")
      .map((e) => {
        const lock = txSkeleton.get("inputs").get(e.index).cell_output.lock;
        const address = generateAddress(lock);
        return `Address: ${address}\nMessage: ${e.message}`;
      })
      .toArray()
      .join("\n");
    reply.text(
      `Please sign the following messages required by the transaction:\n\n${signingInfos}\n\nSignatures must be in hex string format with 0x prefix, each different signature should occupy its own line.`
    );
    return DATA_PAY_SIGNING;
  },
```



## Sign the transaction offline

为了保证安全，Transaction assembling and transaction signing should be separated. It’s recommended to use ckb-cli to sign the transaction  to generate the signature. 

For a grabber, you can

* Use ckb-cli to sign the transaction

### Use ckb-cli to sign the transaction

* The CKB pre-built installer package includes the ckb-cli tool, see [Download the CKB pre-built installer package](https://cryptape.github.io/lumos-doc/docs/reference/ckbnode/#step-1-download-the-ckb-pre-built-installer-package). 
* generate the signature 

```
$ ckb-cli util sign-message --recoverable --from-account <bob's lock_arg> --message <signing message>
```

The following is a signature output example：

```
Password: 
path: m
recoverable: true
signature: 0xd75d630994f862b43c52dc5dfd22306b9fec4112e751a5daf40fef7da0db05d7506a3494b63d7546dbdd2ea93af61f939d162fe7b8fe45da3ef929493a22762600
```




## Seal the transaction with the generated signature

For a grabber, you can

* Commit the generated signature to felix bot.

```
 [DATA_PAY_SIGNING]: async (session, msg, reply) => {
    const envelope = session[DATA_PAY];
    const amount = session[DATA_PAY_AMOUNT];
    const txSkeleton = session[DATA_PAY_ADDRESS];

    console.log(JSON.stringify(txSkeleton,null,2));

    const signatures = (msg.text || "").split("\n");
    let tx;
    try {
      tx = sealTransaction(txSkeleton, signatures);
    } catch (e) {

      console.log(`Error sealing transaction: ${e} stack: ${e.stack}`);
      reply.text("Invalid signatures!");
      return DATA_PAY_SIGNING;
    }  
    
```

## Send the finalized transaction to the CKB network



```
    const txHash = await rpc.send_transaction(tx);

    reply.text(`Envelope successfully paid! TX hash: ${txHash}`);
    delete session[DATA_PAY];
    delete session[DATA_PAY_AMOUNT];
    delete session[DATA_PAY_ADDRESS];
```


[Image: image.png]


