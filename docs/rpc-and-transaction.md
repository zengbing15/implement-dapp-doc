---
id: rpc-and-transaction
title: RPC and Transaction
sidebar_position: 3
---

## RPC

First run a CKB node,then use @ckb-lumos/rpc (the RPC component in [Lumos](https://github.com/nervosnetwork/lumos)) to interact with CKB network，communicating block and transaction information with CKB nodes.

:::info
Lumos is a very handy development tool. CKB DApps can be developed upon lumos. [A transfer-tx DApp demo](transfer-tx-dapp-demo) will introduce how to develop DApps upon lumos step by step. 
:::

### Set Up the Development Environment 

See[Set Up the Development Environment](https://cryptape.github.io/lumos-doc/docs/preparation/setupsystem),then you will run a CKB node on Dev Chain by using [Tippy](https://github.com/nervosnetwork/tippy).

An example of Tippy's dashboard 

![Example dashboard](../static/img/tippy-dashboard.png)

###  Connect to CKB node through RPC

```
$yarn add @ckb-lumos/rpc
```

Get the blockchain info

```
const { RPC } = require(`"@ckb-lumos/rpc"`);
const rpc = `new`` RPC``("http://localhost:8114"``);`
async function main(){
    const result = await rpc.get_blockchain_info();
    console.log(result);
}
main();
```

An example of the blockchain info:

```
  alerts: [],
  chain: 'ckb_dev',
  difficulty: '0x100',
  epoch: '0x64005b0000bc',
  is_initial_block_download: false,
  median_time: '0x17b9c952a1d'
```  
The full code of the example can be found [here](https://github.com/zengbing15/simple-dapp-demo/tree/main/call-rpc).

Great! Now you have got your foot in the door! 

## A transfer transaction on CKB Testnet

At its core, a blockchain is a [replicated deterministic state machine](https://en.wikipedia.org/wiki/State_machine_replication).A state machine is a computer science concept whereby a machine can have multiple states, but only one at any given time. There is a state, which describes the current state of the system, and `transactions`, that trigger state transitions.Given a state S and a transaction T, the state machine will return a new state S'.

```
+--------+                 
|        |                 
| State  |  
|        |             
+--------+                 
    |
    | transactions
    |
+--------+                 
|        |                 
| State' |  
|        |             
+--------+ 

```

Nervos CKB Layer1 also follows this logic, the following is a transfer transaction on CKB Aggron Testnet, the following is the state transition triggered by the transfer transaction:

The payer's address：ckt1qyqddquttee9zqlj7xlmtrd7vjunp2zh5f3spa2vjy
The recipient's address：ckt1qyqv70xf5cusptp0gwzqj8ewsen7j2c0aa8sq5d7y6

An example of transfer transaction on CKB Aggron Testnet

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

The transaction JSON code looks a bit complicated, don't panic, let's look through `Inputs and Outputs` first. 


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

You may find that there are two objects in the `outputs` that are similar in structure (put aside the `inputs` now).

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


You got it!  This is called `Cell` which is the best design about Nervos CKB!

### Cell 

Cells are the primary state units in CKB, so the state transition can be represented:

```
+--------+                 
|        |                 
| Cells  |  
|        |             
+--------+                 
    |
    | transfer transaction
    |
+--------+                 
|        |                 
| Cells' |  
|        |             
+--------+  

```

 A cell has the following fields:

```
Cell: {
 //field name: type
   capacity: Uint64
   lock: Script
   type: Script
   data: Bytes
   } 
```

* **capacity：**Size limit of the cell, also the number of native tokens owned by the cell.
* **lock：**If you think of Cell as a box，it's a lock of the box. Every cell has a lock script.
* **type:** Another type of lock with different uses，it's optional.
* **data:** State data stored in this cell, could be any format.
  * `outputs_data`: The actual data are kept separated for the ease of CKB script handling and for the possibility of future optimizations.


You will find a field called `"previous_output"` in `inputs`

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

The field's name have been fully expressed: `inputs`is the `previous_output`. The `inputs` can be indexed through `tx_hash` and `index`.If you open [CKB-Explorer](https://explorer.nervos.org/aggron/transaction/0xb2d676c6215be0166b5b048396f581b3a0620db6ae879a3556cd8561cbec8ce1) （switch to AGGRON） ，Search for `tx_hash`, you will find the `inputs`with the similar address of the payer's address.

An Example usage of CKB-Explorer

![An Example usage of CKB-Explorer](../static/img/input-cell.png)

In conclusion, the essence of the transaction is to spend some cells, and then generate some new cells, which will also become input cells that need to be spent in another transaction. The unspent cells are called live cells. This concepts are similar to that of [UTXO](https://en.wikipedia.org/wiki/Unspent_transaction_output) in Bitcoin's terminology. 


the state transition can be represented:

```
+--------+                 
|        |                 
| Cell A |  
|        |             
+--------+                 
    |
    | transfer transaction
    |
+--------+                 
|        |                 
| Cell B |
| Cell C |
|        |             
+--------+  

```

### cell_deps and Witnesses

Come to `cell_deps` first, have you found out? `out_point` also made up of `tx_hash` and `index`, so    `cell_deps` is actually pointed to a cell with `tx_hash` and `index`, so what is this cell for?

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

[SECP256K1_BLAKE160](https://github.com/nervosnetwork/ckb-system-scripts/blob/master/c/secp256k1_blake160_sighash_all.c) is a piece of code using the same secp256k1 signature verification algorithm as used in bitcoin.It is the default lock script used to protect the ownership of each cell. 

There is one cell created in the genesis block and SECP256K1_BLAKE160 code is compiled and put in the `data` field of the cell. The transfer transaction should use it as `cell_deps` to protect cells in `inputs and outputs`.

The `tx_hash` and `index` are the same with [SECP256K1_BLAKE160 info](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0024-ckb-system-script-list/0024-ckb-system-script-list.md#locks).

![Secp256k1-info](../static/img/secp256k1-info.png)

The info of secp256k1 cell in Aggron Testnet.


### Lock Script

So what is the specific mode of operation?

The type of the lock script is `Script`， A cell has the following fields:

```
Script: {
// field name: type
   code_hash: H256(hash)
   args: Bytes
   hash_type: String, could be `type` or `data`
   } 
```

The `hash_type` means that the interpretation of code hash when looking for matched dep cells. The default lock script should be `type`:

```
Lock Script: {
   code_hash: H256(hash)
   args: Bytes
   hash_type: type
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