# Deployment into Kovan testnet

Deployment of a contract into Kovan can be done in 5 steps:

1. creation of a project on Infura (FIXME: This step is currently not used but
   might be used for whitelisting),

2. creation of an Ethereum address which will own the deployed contract,

3. getting free test ETH for use by the contract on Kovan,

4. compilation of the contract into bytecode and the ABI,

5. deployment of the bytecode (FIXME: using credentials from the Infura
   project?).

This project automates steps 2, 4 and 5. The other two are explained as well.


## Requirements

- `node`

- `npm`


## Setup

Run `npm i` to install the Node.js dependencies.


## Deployment steps

### Infura project

Create an account at [Infura](https://infura.io/). While in the dashboard, click
on "Create new project", give the project a name and view it. The credentials
are:

- project ID,

- project secret

- Kovan endpoint.


### Contract account creation

Create a new Ethereum account to own the deployment by running `npm run
create-account`. The account number will be stored in `accounts/owner` and the
associated secret key will be stored in `accounts/owner.secret`.


### Getting free Kovan ETH

Submit the account number from `accounts/owner` to the [Kovan testnet Gitter
faucet](https://gitter.im/kovan-testnet/faucet). Do not send the secret! You
should get a confirmation that the account has been sent test ETH.


### Contract compilation and deployment

Compile and deploy the contract by running `node run deploy`. The deployment
script compiles the Solidity contract into the ABI and bytecode internally.  If
the contract deployment is successful, the contract address is saved to
`accounts/contract`.

## Contract testing

Test scripts are found in the `test` directory. Run them by `node run test`.
