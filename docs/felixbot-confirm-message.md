---
sidebar_position: 5
---
# Felix bot: Confirm signing message  

Felix bot reply the transaction hash and a json file named `UnsignedTx.json`
so, what is the `UnsignedTx.json` file used for?

如果你打开 `UnsignedTx.json` 会发现里面是 0x 开头的数据，是把 UnsignedTransaction info 序列化后生成的数据，这个数据通过另一个工具  [generate-message-tool](https://github.com/zengbing15/generate-message-tool) 能够 deserialization 出原本的 transaction，并能通过 transaction 生成 txSkeleton, 最终通过 txSkeleton.signingEntries 的  message 和  felix bot reply 的 signing message 进行比对，如果无误，则证明 offline signing 没有问题, It could be used in a place where the highest level security is required. 


> 序列化和反序列化是非常通用的功能，在网络传输，数据存储上都极其常用。序列化和反序列化的通用解释是：seriallization 序列化 ： 将对象转化为便于传输的格式， 常见的序列化格式：二进制格式，字节数组，json字符串，xml字符串。
deseriallization 反序列化：将序列化的数据恢复为对象的过程。


这里使用的序列化格式是 Molecule ，see [RFC:Serialization](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0008-serialization/0008-serialization.md) , molecule 是 CKB 广泛使用的序列化格式 ，witness 就是用 molecule 序列化的（[feat: use molecule to serialize](https://github.com/nervosnetwork/ckb/pull/1739)） Molecule is a canonicalization and zero-copy serialization format and Molecule 能够极大地减少内存消耗，[nervosnetwork](https://github.com/nervosnetwork)/[moleculec-es](https://github.com/nervosnetwork/moleculec-es) 是 ECMAScript plugin for the molecule serialization system，实现 Confirm signing message 功能会使用 [moleculec-es](https://github.com/nervosnetwork/moleculec-es) . 之后你会更加理解 molecule format ,以及  molecule serialization implementations 和 deserialization implementations.


## Use molecule serialization implementations for serialized `UnsignedTx` 

### Create a schema file 

An unsigned transaction is described via the following molecule formatted `UnsignedTransaction` data structure, see [RFC: Serialization](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0008-serialization/0008-serialization.md) for more information about molecule format. 完整的 schema file 在 github link. 


```

......
struct SighashAllSigning {
    signing_script: Script,
}


union SigningMethods {
    SighashAllSigning,
}

table UnsignedTransaction {
    signing_method: SigningMethods,
    tx: Transaction,
    input_txs: TransactionVec,
    cell_dep_txs: TransactionVec,
    headers: HeaderVec,
}
```

`UnsignedTx` object 由以下组成：  

* `signing_method`：SighashAllSigning which is the default signing solution used in CKB now.也就是使用 secp256k1
* `tx:`发送红包的完整交易
* `input_txs`：given a single input cell is not enough to validate the input cell is correct, we will need the full transaction, so the offline signer can validate the correctness of input cells
* `cell_dep_txs`:   与 input_txs 一样，given a single cell_dep is not enough to validate the cell_dep is correct, we will need the full transaction
* `headers`: INPUT_TX 所在的 block header 

### Compile the schema to `UnsignedTransaction.umd.js` file

```
$ git clone https://github.com/nervosnetwork/moleculec-es.git
$ cd moleculec-es
$ `cargo install moleculec`
`$ moleculec ``--``language ``-`` ``--``schema``-``file ``"your schema file"`` ``--``format json ``>`` ``/tmp/``schema``.``json`
`$ moleculec``-``es ``-``hasBigInt ``-``inputFile ``/``tmp``/``schema``.``json ``-``outputFile ``"your JS file"`
`$ rollup ``-``f umd ``-``n bundle ``-``i ``UnsignedTransaction``.``js ``-``o ``UnsignedTransaction``.``umd``.``js ``// molecule-es 生成的 esm 格式，要转成 umd 格式才能给 node 用`
```

if you open the  在 CKB 中我们广泛使用的序列化格式是 [Molecule](https://docs.ckb.dev/docs/rfcs/0008-serialization/0008-serialization#molecule) ，Molecule is a canonicalization and zero-copy serialization format and Molecule 能够极大地减少内存消耗，之前提到的 witness 就是用 molecule 序列化的：[feat: use molecule to serialize](https://github.com/nervosnetwork/ckb/pull/1739) 
你也可以 see [nervosnetwork](https://github.com/nervosnetwork)/[moleculec-es](https://github.com/nervosnetwork/moleculec-es) , 直接 download precompiled binary from [releases](https://github.com/xxuejie/moleculec-es/releases) page, and put the binary in molecule-es project PATH.  最终生成的  `UnsignedTransaction.umd.js`  就可以用于 serialization.

### Transform plain JavaScript object  to another JavaScript object which can be serialized by moleculec-es

```
UnsignedTransaction.umd.js
  
  function SerializeUnsignedTransaction(value) {
    const buffers = [];
    buffers.push(SerializeSigningMethods(value.signing_method));
    buffers.push(SerializeTransaction(value.tx));
    buffers.push(SerializeTransactionVec(value.input_txs));
    buffers.push(SerializeTransactionVec(value.cell_dep_txs));
    buffers.push(SerializeHeaderVec(value.headers));
    return serializeTable(buffers);
  }
```

你需要生成可以被   `SerializeUnsignedTransaction` fucntion  serialized 的 JS object

需用 [normalizers](https://github.com/nervosnetwork/ckb-js-toolkit#normalizers) class in ckb-js-toolkit, A normalizer function takes plain JavaScript object that can be validated by validator function, it then emits another transformed plain JavaScript object which can be serialized by [moleculec-es](https://github.com/xxuejie/moleculec-es) into serialized ArrayBuffer data in molecule format，For each CKB data structure, we have prepared a normalizer function, see [Function prototypes](https://github.com/nervosnetwork/ckb-js-toolkit#function-prototypes-2).

 generate and transform `UnsignedTx` object,  


```
const { Reader,normalizers } = require("ckb-js-toolkit");

const SighashAllSigning = {
    signing_script: normalizers.NormalizeScript(tx.outputs[0].lock)
   }
   const signing_method = 
   {type: "SighashAllSigning", 
   value: SighashAllSigning}

   const Unsignedtx = Object();

   Unsignedtx.signing_method = signing_method;
   
   Unsignedtx.tx = normalizers.NormalizeTransaction(tx);

 
   const INPUT_TX_HASH = tx.inputs[0].previous_output.tx_hash;
   const input_txs = (await rpc.get_transaction(INPUT_TX_HASH)).transaction;

 
   const CELL_DEP_TX_HASH = tx.cell_deps[0].out_point.tx_hash;
   const cell_dep_txs = (await rpc.get_transaction(CELL_DEP_TX_HASH)).transaction

   const txstatus = (await rpc.get_transaction(INPUT_TX_HASH)).tx_status;
   const headers = (await rpc.get_block(txstatus.block_hash)).header;

   const normalizedinput_txs = normalizers.NormalizeTransaction(input_txs);
 
   Unsignedtx.input_txs = new Array(normalizedinput_txs);
 
   const normalizedcell_dep_txs = normalizers.NormalizeTransaction(cell_dep_txs);
   Unsignedtx.cell_dep_txs = new Array(normalizedcell_dep_txs);
  
   const normalizedheaders = normalizers.NormalizeHeader(headers);
   Unsignedtx.headers = new Array(normalizedheaders);

```



### Generate serialized ArrayBuffer data in molecule format

use `UnsignedTransaction` function in UnsignedTransaction.umd.js

```
const UnsignedTransaction = require ("../schema/UnsignedTransaction.umd.js");
const serializedUnsignedTx = new Reader(
    UnsignedTransaction.SerializeUnsignedTransaction(Unsignedtx)
    ).serializeJson();
```



### download the serializedUnsignedTx json file

```
//download the serializedUnsignedTx json file
    const readable = toStream(Buffer.from(serializedUnsignedTx));

    const writerStream = fs.createWriteStream('UnsignedTx.json');
    readable.pipe(writerStream);

    
    reply.document(fs.createReadStream('UnsignedTx.json'));
```



## Use molecule deserialization implementations for serialized `UnsignedTx`

通过另一个工具  [generate-message-tool](https://github.com/zengbing15/generate-message-tool) 能够 deserialization 出原本的 transaction，并能通过 transaction 生成 txSkeleton, 最终通过 txSkeleton.signingEntries 的  message 和  felix bot reply 的 signing message 进行比对，如果无误，则证明 offline signing 没有问题


### Use molecule deserialization implementations to deserialize UnsignedTx data

a transaction object 由以下 object 组成：see A transfer transaction on CKB Testnet

* version
* cell_deps
* header_deps
* inputs
* outputs
* outputs_data
* witnesses


use UnsignedTransaction.umd.js to deserialize UnsignedTx data for generating the transaction object:
UnsignedTransaction.umd.js 中都用`exports`暴露了相应的 object deserialize 接口


```
  UnsignedTransaction.umd.js
  
  exports.Block = Block;
  exports.Byte32 = Byte32;
  exports.Byte32Vec = Byte32Vec;
  exports.Bytes = Bytes;
  ......
```


只要通过接口调用相应的 getXX() 命令就可以进行 deserialize ，
另外，因为 Hex string might be provided in CKB RPC responses , 所以需要使用  Reader class to convert them to the correct hex format , see [Reader](https://github.com/nervosnetwork/ckb-js-toolkit#reader) in ckb-js-toolkit ,  

```
const UnsignedTransaction = require ("../schema/UnsignedTransaction.umd.js");

/* Read UnsignedTx.json file */

let rawdata = fs.readFileSync('UnsignedTx.json');
let unsignedtx = rawdata.toString();
const wholetx = new Object();
const UnsignedTx = new UnsignedTransaction.UnsignedTransaction(new Reader(unsignedtx));

const tx = UnsignedTx.getTx();

// version object
wholetx.version = "0x"+tx.getRaw().getVersion().toBigEndianUint32().toString(16);

// cell_deps object
const cellDeps_arraybuffer = new Array();
for ( var i=0; i < tx.getRaw().getCellDeps().length(); i++){
  cellDeps_arraybuffer.push({
    "out_point":{
      "tx_hash":tx.getRaw().getCellDeps().indexAt(i).getOutPoint().getTxHash().raw(),
      "index":tx.getRaw().getCellDeps().indexAt(i).getOutPoint().getIndex()
    },
    "dep_type":tx.getRaw().getCellDeps().indexAt(i).getDepType() 
   });
  }

  // "dep_type" = uint8(1) means that "dep_type" is "dep_group"
wholetx.cell_deps = new Array();
for ( var i=0; i < tx.getRaw().getCellDeps().length(); i++){
  wholetx.cell_deps.push({
    "out_point":{
      "tx_hash":"0x"+ Buffer.from(cellDeps_arraybuffer[i].out_point.tx_hash).toString("hex"),
      "index":"0x"+cellDeps_arraybuffer[i].out_point.index.toBigEndianUint32().toString(16)
    },
    "dep_type":"dep_group"
   });
  }

for ( var i=0; i < tx.getRaw().getHeaderDeps().length(); i++){
  outputsData_arraybuffer.push(tx.getRaw().getHeaderDeps().indexAt(i).raw());
   }
// Because headerDeps_arraybuffer = []
wholetx.header_deps = [];


// inputs object
const inputs_arraybuffer = new Array();
for ( var i=0; i < tx.getRaw().getInputs().length(); i++){
  inputs_arraybuffer.push({
    "since":tx.getRaw().getInputs().indexAt(i).getSince().raw(),
    "previous_output":{
      "tx_hash":tx.getRaw().getInputs().indexAt(i).getPreviousOutput().getTxHash().raw(),
      "index":tx.getRaw().getInputs().indexAt(i).getPreviousOutput().getIndex()
    },  
   });
  }

  wholetx.inputs = new Array();

for ( var i=0; i < tx.getRaw().getInputs().length(); i++){
  wholetx.inputs.push({
    "since":"0x"+Buffer.from(inputs_arraybuffer[i].since).toString("hex"),
    "previous_output":{
      "tx_hash":"0x"+Buffer.from(inputs_arraybuffer[i].previous_output.tx_hash).toString('hex'),
      "index":"0x"+inputs_arraybuffer[i].previous_output.index.toLittleEndianUint32().toString(16)
    },
    
   });
  }
  
//outputs object
  const outputs_arraybuffer = new Array();
for ( var i=0; i < tx.getRaw().getOutputs().length(); i++){
  outputs_arraybuffer.push({
    "capacity":tx.getRaw().getOutputs().indexAt(i).getCapacity().toLittleEndianBigUint64(),
    "lock": {
      "code_hash":tx.getRaw().getOutputs().indexAt(i).getLock().getCodeHash().raw(),
      "hash_type":tx.getRaw().getOutputs().indexAt(i).getLock().getHashType(),
      "args":tx.getRaw().getOutputs().indexAt(i).getLock().getArgs().raw()
    }, 
    
   });
  }

  wholetx.outputs = new Array();
for ( var i=0; i < tx.getRaw().getOutputs().length(); i++){
  wholetx.outputs.push({
    "capacity":"0x"+ outputs_arraybuffer[i].capacity.toString(16),
    "lock": {
      "code_hash":"0x"+Buffer.from(outputs_arraybuffer[i].lock.code_hash).toString("hex"),
      "hash_type":"type",
      "args":"0x"+Buffer.from(outputs_arraybuffer[i].lock.args).toString("hex")
    },
   });
  }

//outputs_data object
  const outputsData_arraybuffer = new Array();
for ( var i=0; i < tx.getRaw().getOutputsData().length(); i++){
  outputsData_arraybuffer.push(tx.getRaw().getOutputsData().indexAt(i).raw());
   }

wholetx.outputs_data = new Array()
for ( var i=0; i < tx.getRaw().getOutputsData().length(); i++){
  wholetx.outputs_data.push("0x"+Buffer.from(outputsData_arraybuffer[i]).toString("hex"));
   }

//witnesses object
const witness_arraybuffer =  new Array();
for ( var i=0; i < tx.getWitnesses().length(); i++){
  witness_arraybuffer.push(tx.getWitnesses().indexAt(i).raw());
   }

wholetx.witnesses = new Array()
for (var i=0; i < tx.getWitnesses().length(); i++){
wholetx.witnesses.push("0x"+Buffer.from(witness_arraybuffer[i]).toString("hex"));
}

console.log(JSON.stringify(wholetx,null,2));
```



### Generate  the signing message

可以通过 `common.prepareSigningEntries(txSkeleton)` 生成 signing message ,所以要先生成  txSkeleton.

* 通过 transaction object 拼出 txSkeleton object
* Use [objectToTransactionSkeleton](https://nervosnetwork.github.io/lumos/modules/helpers.html#objecttotransactionskeleton) convert txSkeleton object to TransactionSkeleton type
* Use `common.prepareSigningEntries(txSkeleton)`to generate message

```
const {objectToTransactionSkeleton} = require("@ckb-lumos/helpers");
async function main() {
    
    const rpc = new RPC("http://localhost:8114");
    const INPUT_TX_HASH = wholetx.inputs[0].previous_output.tx_hash;

    const transaction = (await rpc.get_transaction(INPUT_TX_HASH)).transaction;

    const txstatus = (await rpc.get_transaction(INPUT_TX_HASH)).tx_status;
    const blockheader = (await rpc.get_block(txstatus.block_hash)).header;

    // witness = {lock is 0, input_type is null, output_type is null}
  const obj = new Object();
  obj.cellProvider = { indexer };
  obj.cellDeps = transaction.cell_deps;
  obj.headerDeps = transaction.header_deps;
  obj.inputs = List([
    { "cell_output": transaction.outputs[1], 
      "out_point": wholetx.inputs[0].previous_output,
      "block_hash": txstatus.block_hash ,
      "block_number": blockheader.number, 
      "data": transaction.outputs_data[1]}]);
   obj.outputs = new Array();
   for ( var i=0; i < wholetx.outputs.length; i++){
    obj.outputs.push({ "cell_output": wholetx.outputs[i],"data":wholetx.outputs_data[i]});
     }
  obj.witnesses = List(["0x55000000100000005500000055000000410000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"]);
  obj.fixedEntries = [];
  obj.signingEntries = [];
  obj.inputSinces = {};

  let txSkeleton = objectToTransactionSkeleton(obj);
  console.log(JSON.stringify(txSkeleton.toJS(),null,2));

  txSkeleton = common.prepareSigningEntries(txSkeleton);
  //console.log(JSON.stringify(txSkeleton.toJS(),null,2));

  const signingEntriesArray = txSkeleton.signingEntries.toArray();

  console.log("The generated message is "+ signingEntriesArray[0].message);
}

main();
```


生成了 transaction json code and message  to be confirmed. 


## 思考：

不知道你发现没有？Felix bot DApp 几乎所有的数据都在链下处理，提交到链上的只是最终的 tx_hash 而这正是 CKB Layer1 DApp 开发中一个很重要的原则：
除非必要，仅提交最小化的数据到 CKB 链上，一个 Cell 本身就需要 61 CKB，确实是寸土寸金，

就像 CKB（common knowledge base）的名字的意思那样，只有真正的重要的 common knowledge才需要共识，提交到链上，剩下在链下能推导的数据是完全没有必要提交到链上，这样能通过链上的少量数据来确保链下数据的确定性。因此可以既享用区块链的好处，又可以避免区块链性能方面的坏处，这也是 CKB 的 重要 design 思路。