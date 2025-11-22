export const SISTER_SAFE_CONTRACT_ADDRESS =
  "0xa2C563212b15D34Bbc9Af5108093107fd14eF181";

export const SISTER_SAFE_ABI = [
  {
    "inputs": [],
    "name": "verifyUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "circleId",
        "type": "bytes32"
      }
    ],
    "name": "createCircle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "circleId",
        "type": "bytes32"
      }
    ],
    "name": "joinCircle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "circleId",
        "type": "bytes32"
      }
    ],
    "name": "getMembers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
