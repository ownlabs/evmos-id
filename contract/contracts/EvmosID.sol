// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EvmosID is Ownable {
    
    mapping(string => address) private STRINGS;
    mapping(address => string) private ADDRESSES;

    function setIdentity(string memory identity) public {
        require(STRINGS[identity] == address(0), "EvmosID: Identity exists");
        STRINGS[identity] = msg.sender;
        ADDRESSES[msg.sender] = identity;
    }

    function returnIdentityByAddress(address _address) public view returns (string memory) {
        return ADDRESSES[_address];
    }

    function returnIdentityByName(string memory _name) public view returns (address) {
        return STRINGS[_name];
    }

}