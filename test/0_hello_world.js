const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const web3 = new Web3('https://kovan.infura.io');
const expect = require('chai')
      .use(require('chai-as-promised'))
      .expect;
const HelloWorld = require('../scripts/get-contract')('HelloWorld', web3);

describe('Template deployment works', () => {
  it('contract method call works', async () => {
	  let message = await HelloWorld.instance.methods.helloWorld().call();
    expect(message, 'Wrong hello world message').to.equal('Hello, world!');
  });
});
