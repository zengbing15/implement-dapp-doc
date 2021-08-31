---
sidebar_position: 5
---
# A  DApp demo:  Felix bot

Wow , 你已经理解了CKB 相关的重要概念以及如何使用 lumos 开发 DApp，是时候来开发一个稍微复杂一些的 DApp demo 了~

Felix bot 基于 [botgram](https://github.com/botgram/botgram) 开发的，可以给 telegram group member 发送 CKB 红包。实际上这个 DApp demo 也需要实现转账交易，只不过除了转账交易还会有其他与 CKB 交互的需求。为了更加直观理解 DApp 客户端，后端，与CKB layer1 之间的交互，你可以一边运行 felix bot 一边来看相关代码。

## Prerequisites

### Set up the Development Environment

请参考 [Set Up the Development Environment](https://cryptape.github.io/lumos-doc/docs/preparation/setupsystem)  根据你的 Operating System 配置开发环境。

### Prepare three CKB accounts

 Create three accounts: Alice and Bob and Charlie，see [Create Accounts](https://cryptape.github.io/lumos-doc/docs/preparation/createaccount). 

### 设置 Alice 作为 DevChain 的 miner to get capacity

see [Step 5. Get CKB capacity for the account of Alice](https://cryptape.github.io/lumos-doc/docs/reference/ckbaccount#step-5-get-ckb-capacity-for-the-account-of-alice)

### Use CKB-CLI  to transfer some CKB tokens to Bob

```
$ ckb-cli --from-account <ALICE's lock_arg> --to-address <Bob's address> --capacity <capacity> --tx-fee <tx-fee || 0.01>
```

Bob 作为转账交易的发送方，Charlie 则是接收方

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

```
$ https://github.com/zengbing15/felix.git
$ cd felix 
$ npm install
```

### Set up the proxy server

```
export https_proxy=http://127.0.0.1:10080;export http_proxy=http://127.0.0.1:10080;export all_proxy=socks5://127.0.0.1:10081
```

### Set up the BOT_TOKEN

```
$ export BOT_TOKEN=`<BOT_TOKEN>`
```

## Set up the Configuration for Lumos

因为发红包的行为实际上就是个转账交易，要用到 lumos, 所以先配置好 Lumos Config Manager and Lumos Indexer

```
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


