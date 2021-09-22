//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "hardhat/console.sol";


contract Lottery {
    address public manager;
    address payable[] public players;

    event pickedWinner(address indexed winner);

    constructor(){
        manager = msg.sender;
    }

    receive() external payable {
      require(
        msg.value == 0.001 ether,
        'require to sent exactly 0.001 ether'
      );
      players.push(payable(msg.sender));
    }

    function getBalance() public view returns(uint){
      require(
        msg.sender == manager,
        'Only manager can retrieve balance of contract'
      );
      return address(this).balance;
    }

    function random() public view returns(uint){
      // Not the most approriate way how to get random number
      // Using oracle is much safer
      uint randomNum = uint(keccak256(
        abi.encodePacked(
          block.difficulty, block.timestamp, players.length
        )
      ));
      return randomNum;
    }

    function pickWinner() public {
      require(
        msg.sender == manager,
        'Only manager of the lottery can pick the winner'
      );
      require(
        players.length >= 3,
        'Minimum 3 players are required to pick winner'
      );
      uint r = random();
      address payable winner;
      uint index = r % players.length;
      winner = players[index];
      winner.transfer(getBalance());
      players = new address payable[](0); // reseting the lottery
      emit pickedWinner(winner);
    }
}
