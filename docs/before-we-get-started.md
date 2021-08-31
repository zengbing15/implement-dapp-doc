---
sidebar_position: 2
---

# Before We Get Started

## DApp 和 Web App 有何不同？

相信你已经具备了开发 web App 的技能（很可能比我更精通 ORZ ）为了帮助你理解 DApp，先来看看 DApp 和 App 的不同之处吧。注意 ,本文所指的 DApp 都是运行在 CKB 上的 DApp，由于 CKB 的独特性，DApp 的开发方式和其他区块链上的 DApp ，尤其是 Ethereum 上的 DApp 有很大不同，所以开始之前请先把你的“杯子”倒空哦~

APP 

* 客户端
* 发送请求的方式：HTTP 
* 后端：编写后端服务程序，根据客户端请求做出不同的响应。
* Web服务器， nginx/apache

[Image: image.png]

DApp

* 客户端
* 发送请求的方式：RPC
* 后端: 发交易跟链交互，根据客户端的请求做出不同的响应
*  CKB Network 

[Image: image.png]
所以 web APP 和 DApp 的客户端表现是一致的，重点是后端和发送请求的实现方式，所以本文档会重点介绍 DApp 与 web App 开发不一样的地方，再强调一遍，我并不会把所有知识一股脑给到你，而是先从一段调用 RPC 的代码开始，逐步介绍 DApp 的开发方式和需要了解的 CKB 概念及工具，如果你需要直接了解全貌，请看 Conculsion 部分。

智能合约部分的编写
实现客户端和智能合约的交互