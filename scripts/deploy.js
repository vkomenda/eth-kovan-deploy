const constants = require('./constants');
const contractName = constants.contractName;

require('isomorphic-fetch')
require('isomorphic-form-data')
const fs = require('fs')
const path = require('path');
const solc = require('solc');
const Web3 = require('web3')
const web3 = new Web3('https://kovan.infura.io')
const eth = web3.eth
const readFileSync = fs.readFileSync
const writeFileSync = fs.writeFileSync
const toWei = web3.utils.toWei
const ownerSecretFile = path.join(__dirname, '../accounts/owner.secret');
const contractAddressFile = path.join(__dirname, '../accounts/contract');
const privateKey = readFileSync(ownerSecretFile)
const account = eth.accounts.privateKeyToAccount(privateKey.toString())
const address = account.address

function compileContract() {
  console.log(`Compiling ${contractName}.sol...`);
  let input = {
    language: 'Solidity',
    sources: {
      'contract.sol': {
        content: readFileSync(
          path.join(__dirname, `../contracts/${contractName}.sol`),
          'utf-8'
        )
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };
  let compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
  if (typeof compiledContract.errors !== "undefined") {
    console.log(`Compilation errors: ${JSON.stringify(compiledContract.errors, null, 2)}`);
    process.exit();
  }
  return compiledContract.contracts['contract.sol'][contractName];
}

const broadcastTransaction = async (rawTx) => {
  const broadcastUrl = "https://kovan.etherscan.io/api"
  const data = new FormData()
  data.append('module', 'proxy')
  data.append('action', 'eth_sendRawTransaction')
  data.append('hex', rawTx)
  let resp = await fetch(broadcastUrl, {
    method: "post",
    body: data,
  })
  resp = await resp.json()
  return resp
}

const getContractAddressFromTx = async (txHash) => {
  const getTxDataUrl = `https://kovan.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}`
  let resp = await fetch(getTxDataUrl)
  resp = await resp.json()
  return resp.result.creates
}

console.log(`Loading ETH account: ${address}`)

let compiledContract = compileContract();
let abi = compiledContract.abi;
let bytecode = compiledContract.evm.bytecode.object;
let build_dir = path.join(__dirname, '../build');
  try {
    fs.mkdirSync(build_dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
writeFileSync(
  path.join(build_dir, `${contractName}.json`),
  JSON.stringify(abi, null, 2)
);

; // leave this before async
(async () => {

  // connection check:
  const blockNumber = await eth.getBlockNumber()
  console.log(`Kovan block number: ${blockNumber}`)
  if (!blockNumber) {
    console.log("Got wrong response from Kovan Infura, please check your Infura token.")
    process.exit()
  }

  // estimate contract deployment cost
  const gasCost = await eth.estimateGas({ data: `0x${bytecode}` })
  console.log("gasCost:", gasCost)

  const deployOptions = {
    chainId: "0x2A", // Kovan chain (id: 42)
    from: address,
    gas: gasCost * 2,
    data: `0x${bytecode}`,
    gasPrice: toWei("6", "gwei"),
  }

  console.log("Deploying contract...")

  const tx = await account.signTransaction(deployOptions)
  const txRaw = tx.rawTransaction
  console.log("Raw TX:", txRaw)
  console.log("You can also push manually via https://kovan.etherscan.io/pushtx")

  const response = await broadcastTransaction(txRaw)
  console.log("PUSH TX:", response)

  if (response && response.result) {
    const txHash = response.result
    const contractAddress = await getContractAddressFromTx(txHash)
    console.log("Contract address:", contractAddress)
    writeFileSync(contractAddressFile, contractAddress)
  }
})()
