---
sidebar_position: 3
---

# Implement a Transfer-Tx DApp demo 所需知识

## Set Up the Development Environment 

CKB DApps can be developed on all major platforms, including Linux, Windows, and macOS. 请参考 [Set Up the Development Environment](https://cryptape.github.io/lumos-doc/docs/preparation/setupsystem)  根据你的 Operating System 配置开发环境。

##  Connect to CKB node through RPC

前面提到 APP 会通过一个HTTP的请求发到服务器，从而调用对应的后端服务程序，DApp 则是通过 RPC connect to CKB  Network 中的 nodes. 
[Image: image.png]
所以方法很简单：本地运行一个 CKB 节点，然后再调用 RPC 接口。这里会用到一个非常好用的开发工具：lumos , CKB DApps  can be developed upon lumos. 后面会逐步介绍如何使用 lumos 开发 DApp。先来看用  lumos 的 rpc component(package)调用 RPC 接口，文字没有实感，来动手实践吧：

### Run a CKB Node on DEV Chain by Using Tippy

如果你已经完成开发环境的配置，那么你已经运行了一个 CKB Node on Dev Chain 了

click here to view dashboard ：
[Image: image.png]
### Call RPC interface to get blockchain info

Use `@ckb-lumos/rpc` . The RPC component (`@ckb-lumos/rpc`) interacts with the CKB network, communicating block and transaction information with CKB nodes.

```
$yarn add @ckb-lumos/rpc
```

请求获取 blockchain info

```
const { RPC } = require(`"@ckb-lumos/rpc"`);
const rpc = `new`` RPC``("http://localhost:8114"``);`
async function main(){
    const result = await rpc.get_blockchain_info();
    console.log(result);
}
main();
```

这时候你就会获得 blockchain info, 有求必应的感觉还不错吧~


## A transfer transaction on CKB Testnet

DApp 和 App 后端最大的不同在于DApp 是通过发交易与 CKB 交互的，所以理解 CKB 的交易是非常重要的，this section 可能涉及到的概念比较多，不过不用担心，我还是会和实践相结合，力求能让大家更容易理解。

区块链可以看作是状态机，记录着链上状态，每次有新的交易被打包进入区块提交上链，都意味着区块链根据协议中定义的状态转换逻辑进行了状态转换, Nervos CKB Layer1 也遵循着这样的逻辑。先来看一笔发生在 CKB Aggron Testnet 上的转账交易 （转账交易结构比较简单），这笔转账交易实际上是发送方转给接收方一些 CKB, 可以表示成，
发送方地址：ckt1qyqddquttee9zqlj7xlmtrd7vjunp2zh5f3spa2vjy
接收方地址：ckt1qyqv70xf5cusptp0gwzqj8ewsen7j2c0aa8sq5d7y6

* Input: 
    * 发送方 原状态
* Output
    * 接收方  状态
    * 发送方 新状态


不过交易代码乍一看有点复杂，没关系，我们把交易拆分成两部分： Inputs and Outputs ，cell_deps and witnesses


```
{
  "version": "0x0",
  "cell_deps": [
    {
      "out_point": {
        "tx_hash": "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
        "index": "0x0"
      },
      "dep_type": "dep_group"
    }
  ],
  "header_deps": [],
  "inputs": [
    {
      "since": "0x0",
      "previous_output": {
        "tx_hash": "0xb2d676c6215be0166b5b048396f581b3a0620db6ae879a3556cd8561cbec8ce1",
        "index": "0x1"
      }
    }
  ],
  "outputs": [
    {
      "capacity": "0x56cc9c900",
      "lock": {
        "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        "hash_type": "type",
        "args": "0xcf3cc9a63900ac2f4384091f2e8667e92b0fef4f"
      }
    },
    {
      "capacity": "0x5a5f6d2bccdc",
      "lock": {
        "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        "hash_type": "type",
        "args": "0xd6838b5e725103f2f1bfb58dbe64b930a857a263"
      }
    }
  ],
  "outputs_data": [
    "0x",
    "0x"
  ],
  "witnesses": [
    "0x550000001000000055000000550000004100000078aa17dc603d72b8dcd7d214f9a6e4bb4bbf6c77f172a66d889f3958aa16f8a812e6b7d3e3ed56f361d255b7a834bdbc2e69442da536e2ae7a0b3feffa2b556f01"
  ]
}
```




### Inputs and Outputs

```
"inputs": [
    {
      "since": "0x0",
      "previous_output": {
        "tx_hash": "0xb2d676c6215be0166b5b048396f581b3a0620db6ae879a3556cd8561cbec8ce1",
        "index": "0x1"
      }
    }
  ],
  "outputs": [
    {
      "capacity": "0x56cc9c900",
      "lock": {
        "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        "hash_type": "type",
        "args": "0xcf3cc9a63900ac2f4384091f2e8667e92b0fef4f"
      }
    },
    {
      "capacity": "0x5a5f6d2bccdc",
      "lock": {
        "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        "hash_type": "type",
        "args": "0xd6838b5e725103f2f1bfb58dbe64b930a857a263"
      }
    }
  ],
  "outputs_data": [
    "0x",
    "0x"
  ],
```

你可能发现了 outputs 中 有两个结构类似的 object（inputs 暂时放在一边，先不去管它）

```
  "outputs": [
    {
      "capacity": "0x56cc9c900",
      "lock": {
        "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        "hash_type": "type",
        "args": "0xcf3cc9a63900ac2f4384091f2e8667e92b0fef4f"
      }
    },
    {
      "capacity": "0x5a5f6d2bccdc",
      "lock": {
        "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        "hash_type": "type",
        "args": "0xd6838b5e725103f2f1bfb58dbe64b930a857a263"
      }
    }
  ],
   "outputs_data": [
    "0x",
    "0x"
  ],
```


You get it!  这个叫做  Cell ( 这可是 CKB 最棒的东西了！)

### Cell 

Cell 是 CKB 中最基本的状态单元。所以交易可以表示成：

Inputs: 

* 发送方Cell

Outputs:

* 接收方 Cell
* 发送方 新 Cell

一个 Cell 由以下几个字段组成:

```
Cell: {
   capacity: uint64
   lock: Script
   type: Script
   data: `Bytes`
   } 
```

四个字段具体含义如下：

* **capacity：**表示 Cell 的空间大小，同时也是这个 Cell 代表的原生代币的数量，
* **lock：**是一个 Script，本质相当于是一把锁。每个 Cell 都有这种锁。
* **type:** 是一个 Script，和 lock 一样，只是锁的用途不同，是 optional。
* **data:** 是一个无格式字符串，可以在这里存放任何类型的数据。实现过程中，为了方便处理，我们把所有 Cell 的 data 都放到` outputs_data`

如果把 Cell 看成是盒子的话，Cell 代表的原生代币的数量越多，盒子越大，盒子里装的是任何类型的数据 data，也就是说 Nervos CKB 链上的数据存放空间是要用 CKB 原生代币换的。嗯，可以说是寸土寸金吧~


所以 outputs 可以表示成这样：

* 接收方 Cell
    * capacity: 0x56cc9c900
    * lock 锁
    * data: 0x
* 发送方 新 Cell
    * capacity: 0x5a5f6d2bccdc
    * lock 锁
    * data: 0x

接下来我们来看  Inputs ，你会发现里面有一个字段 `"previous_output"`


```
"inputs": [
    {
      "since": "0x0",
      "previous_output": {
        "tx_hash": "0xb2d676c6215be0166b5b048396f581b3a0620db6ae879a3556cd8561cbec8ce1",
        "index": "0x1"
      }
    }
  ],
```


字段名已经完全表达了含义：inputs 就是 previous output  （名字起得是不是很好~），由 tx_hash 和 index 索引到 Cell， 如果你打开 [CKB-Explorer](https://explorer.nervos.org/aggron/transaction/0xb2d676c6215be0166b5b048396f581b3a0620db6ae879a3556cd8561cbec8ce1) （记得切换网络） ，用 tx_hash 搜索，就会找到这笔交易的 `"index": "0x1"` 的 Cell, 这就是  inputs cell 

[Image: image.png]

总结一下，CKB 中的基本状态单元是 Cell, 交易的本质就是销毁一些 Cell，再生成一些新的 Cell，这些新的 Cell 也会成为另一笔交易中的需要销毁的 input cells。 The concept is similar to that of [UTXO](https://en.wikipedia.org/wiki/Unspent_transaction_output) in Bitcoin's terminology. 


Cool! 你已经弄清楚 CKB TX 中最核心的部分，那么接下去来看剩下的部分


### cell_deps and Witnesses

先来看` cell_deps` ， 你发现了吗？`out_point`  也是`tx_hash` 和 `index`  组成的，所以 cell_deps 实际上也是用 `tx_hash` 和 `index` 指向了一个 cell，那么这个 cell 是用来干什么的呢？

```
  "cell_deps": [
    {
      "out_point": {
        "tx_hash": "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
        "index": "0x0"
      },
      "dep_type": "dep_group"
    }
  ],
```

CKB 系统内建了一个很重要的智能合约叫 [SECP256K1_BLAKE160](https://github.com/nervosnetwork/ckb-system-scripts/blob/master/c/secp256k1_blake160_sighash_all.c)， 它是每个 Cell 在普通的转账交易中默认使用的 lock 锁 。 这把锁代表的就是用 SECP256K1 这种特定的加密算法，来保护每个 Cell 最基础的所属权。CKB 系统在创世块的时候创建了一些 cell, 把实际上要执行的合约代码，放在了 cell 的 data 字段里，转账时，我们把这些 Cell 作为 cell_deps 引入到交易中。

对比[SECP256K1_BLAKE160 的 info](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0024-ckb-system-script-list/0024-ckb-system-script-list.md#locks) 可以看到 tx_hash 和 index 是一致的，如果去 CKB-Explorer 查这个 [Cell info](https://explorer.nervos.org/aggron/transaction/0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37) ，可以看到 data 部分是有数据的。
[Image: image.png][Image: image.png]


### Lock Script （lock 锁）

那么具体的运作方式是什么样的呢？

CKB 中这样的“锁”，叫做 Script， 一个 Script 由以下几个字段组成:

```
Script: {
   code_hash: H256(hash)
   args: Bytes
   hash_type: String, could be ``type`` or ``data`  `
   } 
```

本文档中的 Cell 用到的 lock Script：

```
Lock Script: {
   code_hash: H256(hash)
   args: Bytes
   hash_type: ``type`` 
   } 
```



在 code_hash 填上 dep_cell 的 code hash，同时在 args 字段放入自己的公钥哈希， 发起交易时， 就用私钥对这笔交易做一个签名，Witnesses 放的就是这个签名。这样SECP256K1 加密算法输入公钥和签名，就能判断这笔交易是不是由对应的私钥发起的， 从而也就能判断背后是不是这个 Cell 真正的主人在操作，也就是保证了 Cell 的所属权。

对比 [SECP256K1_BLAKE160 的 info](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0024-ckb-system-script-list/0024-ckb-system-script-list.md#locks)  的 code_hash 与 output cells 中的 code_hash 是 一致的。

[Image: image.png]

```
  "cell_deps": [
    {
      "out_point": {
        "tx_hash": "0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
        "index": "0x0"
      },
      "dep_type": "dep_group"
    }
  ],
  ......
  "outputs": [
    {
      "capacity": "0x56cc9c900",
      "lock": {
        "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        "hash_type": "type",
        "args": "0xcf3cc9a63900ac2f4384091f2e8667e92b0fef4f"
      }
    },
    {
      "capacity": "0x5a5f6d2bccdc",
      "lock": {
        "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        "hash_type": "type",
        "args": "0xd6838b5e725103f2f1bfb58dbe64b930a857a263"
      }
    }
  ],
  "outputs_data": [
    "0x",
    "0x"
  ],
  "witnesses": [
    "0x550000001000000055000000550000004100000078aa17dc603d72b8dcd7d214f9a6e4bb4bbf6c77f172a66d889f3958aa16f8a812e6b7d3e3ed56f361d255b7a834bdbc2e69442da536e2ae7a0b3feffa2b556f01"
  ]
}
```



### Address and Lock Script

最后还需要你理解一个东西，就是转账交易双方的 Address：

* 发送方地址：ckt1qyqddquttee9zqlj7xlmtrd7vjunp2zh5f3spa2vjy
* 接收方地址：ckt1qyqv70xf5cusptp0gwzqj8ewsen7j2c0aa8sq5d7y6


在 CKB 中，Account 就是一堆 live cell 的集合，具有同样的 lock，地址 packages a lock script into a single line in a verifiable and human-readable format. 所以 address 就代表了 account ，此外地址还遵循一定的 format，"ckt" is for the testnet or devchain, see [RFC: CKB Address Format](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0021-ckb-address-format/0021-ckb-address-format.md#ckb-address-format)

private key, public key（args）, lock script, and CKB address 之间的关系是这样的：
[Image: image.png]


### Create CKB accounts 

[CKB-CLI](https://github.com/nervosnetwork/ckb-cli) 可以用来生成 account 需要的所有信息， see [Create the Accounts by Using ckb-cli](https://cryptape.github.io/lumos-doc/docs/reference/ckbaccount#create-the-accounts-by-using-ckb-cli)


* Prerequisites：[Run a CKB Node on DEV Chain by Using Tippy](https://cryptape.github.io/lumos-doc/docs/preparation/setupsystem)
* Step 1. [Download the CKB pre-built installer package](https://cryptape.github.io/lumos-doc/docs/reference/ckbaccount#step-1-download-the-ckb-pre-built-installer-package).
* Step 2. [Verify the ckb-cli tool is working and check the version](https://cryptape.github.io/lumos-doc/docs/reference/ckbaccount#step-2-verify-the-ckb-cli-tool-is-working-and-check-the-version).
* Step 3. [Create the account](https://cryptape.github.io/lumos-doc/docs/reference/ckbaccount#step-3-create-the-account-for-alice)
* Step 4. [Get the private key for the account](https://cryptape.github.io/lumos-doc/docs/reference/ckbaccount#step-4-get-the-private-key-for-the-account-of-alice)
* Step 5. [Get CKB capacity for the account](https://cryptape.github.io/lumos-doc/docs/reference/ckbaccount#step-5-get-ckb-capacity-for-the-account-of-alice)


这是：ckt1qyqddquttee9zqlj7xlmtrd7vjunp2zh5f3spa2vjy 的 info

```
address:
  mainnet: ckb1qyqddquttee9zqlj7xlmtrd7vjunp2zh5f3suc5n7c
  testnet: ckt1qyqddquttee9zqlj7xlmtrd7vjunp2zh5f3spa2vjy
lock_arg: 0xd6838b5e725103f2f1bfb58dbe64b930a857a263
lock_hash: 0x10f9a227094e77ee9149b3e8ed1e34f6d5c7c604bab81e0df42f13e1d33ac0fb 
```


这是：ckt1qyqv70xf5cusptp0gwzqj8ewsen7j2c0aa8sq5d7y6 的info

```
address:
    mainnet: ckb1qyqv70xf5cusptp0gwzqj8ewsen7j2c0aa8sa3npgx
    testnet: ckt1qyqv70xf5cusptp0gwzqj8ewsen7j2c0aa8sq5d7y6
  lock_arg: 0xcf3cc9a63900ac2f4384091f2e8667e92b0fef4f
  lock_hash: 0xc7cea924f48d069396b6826ee17653580d90d505544fa6940dbba3d24d9258ba
```


对比 这两个地址的 lock_arg 和 output cells 的 args 是一致的。

```
  "outputs": [
    {
      "capacity": "0x56cc9c900",
      "lock": {
        "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        "hash_type": "type",
        "args": "0xcf3cc9a63900ac2f4384091f2e8667e92b0fef4f"
      }
    },
    {
      "capacity": "0x5a5f6d2bccdc",
      "lock": {
        "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
        "hash_type": "type",
        "args": "0xd6838b5e725103f2f1bfb58dbe64b930a857a263"
      }
    }
  ],
  "outputs_data": [
    "0x",
    "0x"
  ],
  "witnesses": [
    "0x550000001000000055000000550000004100000078aa17dc603d72b8dcd7d214f9a6e4bb4bbf6c77f172a66d889f3958aa16f8a812e6b7d3e3ed56f361d255b7a834bdbc2e69442da536e2ae7a0b3feffa2b556f01"
  ]
}
```

### Witnesses

* contained signature which is generated by 发送方 private_key

```
// witness = {lock is 0, input_type is null, output_type is null}
```

```
Witnesses = List(["0x55000000100000005500000055000000410000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"]);
```



### 总结，这笔 转账交易可以表示成这样：

Cell_deps:

* point to the cell with SECP256K1 code

Inputs: 

* 发送方Cell：point to previous_output

Outputs:

* 接收方 Cell
    * capacity: 0x56cc9c900
    * lock script
        * SECP256K1 code hash
        * 接收方 public_key hash
    * data: 0x
* 发送方 新 Cell
    * capacity: 0x5a5f6d2bccdc
    * lock script
        * SECP256K1 code hash
        * 发送方 public_key hash
    * data: 0x

最终用 私钥对这笔交易进行签名并发送上链。

### How to sign the transfer transaction


We need the following arguments to sign a tx， see [How to sign transaction](https://github.com/nervosnetwork/ckb-system-scripts/wiki/How-to-sign-transaction)


```
`* pk, secp256k1 private key
* witnesses, contains signatures of the tx.`
```

this is the default signing solution used in CKB now.

剩下的字段 `version` ， `header_deps`，`since` 跟本文档内容关系不大，[see RFC: Data Structures of Nervos CKB](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0019-data-structures/0019-data-structures.md)