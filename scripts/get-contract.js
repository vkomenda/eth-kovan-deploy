const constants = require('./constants');
const fs = require('fs')
const path = require('path');
const readFileSync = fs.readFileSync;

let address = readFileSync(
  path.join(__dirname, '../accounts/contract'),
  'utf-8'
);

module.exports = function (contractName, web3) {
  var abi;
  var info;
  if (contractName === constants.contractName) {
    abi = require(`../build/${contractName}`);
    return {
      address: address,
      abi: abi,
      instance: new web3.eth.Contract(abi, address),
    };
  } else {
    throw new Error('Unknown contract ' + contractName);
  }
}
