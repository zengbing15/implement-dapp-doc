---
sidebar_position: 2
---

# Before We Get Started

## What's the difference between DApp and Web App?

I'm sure you already have the skills to develop web apps (probably more than I do).
To help you understand DApps, let's take a look at the differences between DApps and Apps.

:::note
The DApps mentioned in this doc site are all DApps running on CKB layer1. Due to the uniqueness of Nervos CKB network, DApps are developed in a very different way than DApps on other blockchains, especially Ethereum, so please empty your cup first.
:::

APP 
* Client 
* Send requests through HTTP 
* Back-end: write programs that respond to requests.
* Web server, such as nginx/apache

DApp
* Client 
* Send requests through RPC
* Back-end: send transactions that respond to requests.
* CKB network 

The client side of web app and DApps are almost the same, you should focus on the implementation of back-end and RPC, so let's look through RPC and transaction first.