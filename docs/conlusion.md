---
id: conclusion
title: Conclusion
sidebar_position: 7
---


## About CKB

## Felix bot: A DApp demo on CKB layer1



Felix bot 基于 [botgram](https://github.com/botgram/botgram) 开发的，从实现上来看，DApp 和 web APP 和的客户端表现是一致的，重点是后端和发送请求的实现方式：Before We Get Started: DApp 和 Web App 有何不同？

Felix bot:

Client—botgram —HTTP— telegram bot 服务器
                  | |
                lumos —RPC— Nervos CKB network

Offline signing scheme:

Molecule serialization system

UnsignedTx —Serialization— UnsignedTx data 
   message   —  Deserialization   ——    |




Felix bot 的功能如下：

* 可以给 telegram group member 发送 CKB 红包。
* 最终 reply signing message ，use this message to sign offline
*  reply the transaction hash and a json file named `UnsignedTx.json`
* use Confirm signing message feature, 实现更安全的 signing scheme: 
    * 另一个工具  [generate-message-tool](https://github.com/zengbing15/generate-message-tool) 能够 through `UnsignedTx.json` 最终生成 a message, 用户可以和  felix bot reply 的 signing message 进行比对，二次确认。



### A  DApp demo:  Felix bot

* Prerequisites
    * About Account：see Address and Lock Script
* Run the felix bot
* Set up the Configuration for Lumos
    * About lumos configuration: see Set up the Configuration for Lumos
* Use [parseAddress](https://nervosnetwork.github.io/lumos/modules/helpers.html#parseaddress) to confirm receiving address  
* Build the transaction skeleton
* Sign the transaction offline

* Seal the transaction with the generated signature
    * About use lumos to build txSkeleton: see Build the Transfer  Transaction
    * About transaction on CKB: see A transfer transaction on CKB Testnet
        * 思考: CKB 与 以太坊 编程模型的不同之处
* Send the finalized transaction to the CKB network
    * About RPC interface：Connect to CKB node through RPC

### Felix bot: Confirm signing message  

* Use molecule serialization implementations for serialized `UnsignedTx` 
* Use molecule deserialization implementations for serialized `UnsignedTx`
    * About molecule: molecule 是 CKB 广泛使用的序列化格式, see [RFC:Serialization](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0008-serialization/0008-serialization.md)  and ECMAScript plugin for the molecule serialization system:  [moleculec-es](https://github.com/nervosnetwork/moleculec-es)
    * 思考：CKB Layer1 DApp 开发中一个很重要的原则：除非必要，仅提交最小化的数据到 CKB 链上



## A transfer-tx  DApp demo

lumos —RPC— Nervos CKB network

The transfer-tx DApp demo is based on Lumos functionalities to implement the most basic functions, see A transfer-tx  DApp demo.




## To be Continued

### Mercury

后续 lumos 会进行优化，只依赖 mercury，变成一个纯前端的库。 Mercury is a tool that handles applications development on CKB. Mercury is like the bridge between CKB and applications. It provides useful RPC services for DApps that are built upon Lumos,
see [Github repo](https://github.com/nervosnetwork/mercury).

### Godwoken

思考: CKB 与 以太坊 编程模型的不同之处 提到 CKB 与 以太坊 编程模型 有本质不同，以太坊链上状态在 EVM 执行过交易之后才能确定。而 CKB 链下构建完交易之后，链上状态已经通过交易的 output 确定了，链上只是对交易的合法性进行验证，不会改变交易结果。不过虽然编程模型不同， Ethereum dApp 开发者如果想在 CKB 上开发，不需要重新学习一套新的编程模型和工具。

CKB 开发团队开发了一套 layer2 解决方案：Godwoken [godwoken](https://github.com/nervosnetwork/godwoken) , 以及基于 Godwoken 开发的 Polyjuice 工具 [](https://github.com/nervosnetwork)[godwoken-polyjuice](https://github.com/nervosnetwork/godwoken-polyjuice)， 采用了 采用 VM on VM 的设计方案，在 CKB-VM 中运行 EVM 的实现。通过 Polyjuice ，可以在 Godwoken （Nervos CKB layer2）上运行和开发Ethereum dApp，提供了良好的开发体验。

目前正在举办 [hackathon](https://gitcoin.co/hackathon/nervos?org=nervosnetwork) 活动，欢迎大家参加，详细的开发文档也即将上线，敬请期待~



## References

* Documentation
    * Nervos Document Website  https://docs.nervos.org/
    * Lumos-doc https://cryptape.github.io/lumos-doc/
    * Nervos Network RFCs: https://github.com/nervosnetwork/rfcs
* Tools
    * [Tippy](https://github.com/nervosnetwork/tippy)
    * CKB-CLI (https://github.com/nervosnetwork/ckb-cli). CKB command line tool written in Rust.
    * ckb-js-toolkit
    * Molecule (https://github.com/nervosnetwork/molecule). Serialization system used on CKB.
    * CKB system scripts: https://github.com/nervosnetwork/ckb-system-scripts
    * mercury  
    * ckb-indexer
* Blogs
    * About Nervos CKB 设计原理   https://medium.com/@janhxie
    * About CKB Programing: https://xuejie.space/



## Contact & Support


If you find issues with the documentation or have suggestions on how to improve the documentation , please [file an issue](https://github.com/zengbing15/implement-dapp-doc) for us, or send a email [zengb@cryptape.com](mailto:zengb@cryptape.com).

 you can create a post on  [Nervos Talk](https://talk.nervos.org/)  or join [Discord](https://discord.com/invite/AqGTUE9) Talk to us first!


