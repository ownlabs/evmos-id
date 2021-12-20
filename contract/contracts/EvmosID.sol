// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EvmosID is Ownable {
    
    mapping(string => address) private STRINGS;
    mapping(string => address) private LINKS;
    mapping(address => mapping(uint256 => string)) private OWNED;
    mapping(address => uint256) private COUNTERS;
    uint256 public REGISTERED = 0;

    function setIdentity(string memory _name) public {
        require(STRINGS[_name] == address(0), "EvmosID: Identity exists");
        STRINGS[_name] = msg.sender;
        LINKS[_name] = msg.sender;
        OWNED[msg.sender][COUNTERS[msg.sender]] = _name;
        COUNTERS[msg.sender] += 1;
        REGISTERED += 1;
    }

    function changeLink(string memory _name, address _address) public {
        require(STRINGS[_name] == msg.sender, "EvmosID: Can't manage an address you don't own");
        LINKS[_name] = _address;
    }

    function transferName(string memory _name, address _to) public {
        require(STRINGS[_name] == msg.sender, "EvmosID: Can't manage an address you don't own");
        for(uint256 i = 0; i < COUNTERS[msg.sender]; i++){
            if(keccak256(abi.encodePacked(OWNED[msg.sender][i])) == keccak256(abi.encodePacked(_name))){
                OWNED[msg.sender][i] = "";
            }
        }
        LINKS[_name] = _to;
        STRINGS[_name] = _to;
        OWNED[_to][COUNTERS[_to]] = _name;
        COUNTERS[_to] += 1;
    }

    function returnAddressByName(string memory _name) public view returns (address) {
        return LINKS[_name];
    }

    function returnOwnedByAddress(address _address) public view returns (uint256) {
        return COUNTERS[_address];
    }

    function returnNameByAddress(address _address, uint256 _index) public view returns (string memory) {
        return OWNED[_address][_index];
    }

}