---
sidebar_position: 1
slug: /
---

# Overview

## Target users

本文档的目标用户是给具备 Programming skills of Node.js projects for applications，了解区块链，对 CKB 感兴趣，想在 CKB layer1 上开发 DApp 的开发者，期望大家看完本文档之后，能更快地上手 CKB 开发，沉浸 CKB 的奇妙世界“Inception”。

## Content Overview

本文档并不是一个单纯的 project tutorial , 你可以把本文档当成 CKB Programming Introduction，最终会实现一个叫做 Felix bot 的 DApp demo, 可以用于在 telegram 群中发送 CKB 红包， 在实现这个 DApp 的过程中，会逐步介绍需要掌握的 CKB 概念和用于开发 DApp 的工具 [lumos](https://cryptape.github.io/lumos-doc/docs/introduction/about) 。再好的理论如果不实践，永远不知道到底学会了没有，所以我认为这样理论和实践相结合的方式能够更深入地了解 CKB。

另外，本文档并不会把 Felix bot 的 设计，运作方式以及涉及到的 CKB 概念一股脑的给到你，而是从一段调用 RPC 的代码开始带你探索 CKB 世界。因为我自己就是个新手，就我个人经验，新手一次性接收太多信息容易无所适从，都是重点也就等于没有重点， 不过如果你想先整体了解也没问题，可以直接看 Conclusion 部分，总之，希望本文档能够起到抛砖引玉的作用，有任何建议也请随时给我发邮件 [zengb@cryptape.com](mailto:zengb@cryptape.com) ，期待你的反馈(*^▽^*)

* For starters, it is recommended to read through the following sections linearly:
    * Before We Get Started: DApp 与 Web App 的不同之处
    * Implement a simplest DApp demo: Transfer-Tx DApp demo
        * About CKB: cell, script, transaction, lumos, ckb-js-toolkit，链下计算链上验证
    * Implement a more complicated DApp demo: Felix bot DApp demo
        * About CKB: CKB address format , How to sign tx,  offline signing，lumos
    * Add a feature of confirming signing message on Felix bot
        * About CKB: highest security offline signing, molecule data structure, serialization, deserialization，
* 如果你想直接了解全貌
    * Conclusion
        * Felix bot DApp demo and Transfer-Tx DApp demo
        * To be Continued
            * ckb-indexer 
            * Godwoken: Account Model and Cell Model
















