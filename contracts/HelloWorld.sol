pragma solidity ^0.5.0;

contract HelloWorld {
  string public message;
  address payable owner;

  constructor() public {
    owner = msg.sender;
    message = "Hello, world!";
  }

  function helloWorld() public view returns (string memory) {
    return message;
  }

  function kill() public {
    if (owner == msg.sender) {
      selfdestruct(owner);
    }
  }
}
