// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SisterSafeCircle {
    mapping(address => bool) public isVerified;
    mapping(bytes32 => address[]) public circleMembers;
    mapping(address => bool) public hasJoined;

    event UserVerified(address indexed user);
    event CircleCreated(bytes32 indexed circleId, address indexed creator);
    event JoinedCircle(bytes32 indexed circleId, address indexed user);

    // TEMP: placeholder until Self integration
    function verifyUser() external {
        isVerified[msg.sender] = true;
        emit UserVerified(msg.sender);
    }

    function createCircle(bytes32 circleId) external {
        require(isVerified[msg.sender], "Not verified");
        require(circleMembers[circleId].length == 0, "Circle already exists");

        circleMembers[circleId].push(msg.sender);
        hasJoined[msg.sender] = true;

        emit CircleCreated(circleId, msg.sender);
    }

    function joinCircle(bytes32 circleId) external {
        require(isVerified[msg.sender], "Not verified");
        require(!hasJoined[msg.sender], "Already joined");

        require(circleMembers[circleId].length > 0, "Circle does not exist");

        circleMembers[circleId].push(msg.sender);
        hasJoined[msg.sender] = true;

        emit JoinedCircle(circleId, msg.sender);
    }

    function getMembers(bytes32 circleId) external view returns (address[] memory) {
        return circleMembers[circleId];
    }
}
