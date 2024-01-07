const { keccak256 } = require('ethereum-cryptography/keccak');
const { bytesToHex } = require('ethereum-cryptography/utils');

class MerkleTree
{
  constructor(leaves)
  {
    this.leaves = leaves.map(Buffer.from).map(keccak256);
    this.concat = (left, right) => keccak256(Buffer.concat([left, right]));
  }

  getRoot()
  {
    return bytesToHex(this._getRoot(this.leaves));
  }
  _getRoot(leaves = this.leaves)
  {
    if (leaves.length == 1)
        return leaves[0];

    const newLeaves = [];
    for (let i=0; i<leaves.length; i+=2)
    {
        const left = leaves[i];
        const right = leaves[i+1];
        
        if (!right) newLeaves.push(left);
        else newLeaves.push(this.concat(left, right));
    }
    return this._getRoot(newLeaves);
  }


  getProof(index, leaves = this.leaves, proof = [])
  {
    if (leaves.length == 1)
        return proof;

    const newLeaves = [];
    for (let i=0; i<leaves.length; i+=2)
    {
        const left = leaves[i];
        const right = leaves[i+1];
        
        if (!right) newLeaves.push(left);
        else newLeaves.push(this.concat(left, right));
    }

    const isLeftSide = index % 2 == 0;
    if (isLeftSide)
    {
        if (leaves[index+1])
            proof.push(this._getProofData(leaves[index+1], false));
    }
    else
        proof.push(this._getProofData(leaves[index-1], true));

    return this.getProof(Math.floor(index/2), newLeaves, proof);
  }
  
  _getProofData(data, isLeft)
  {
      return {
          data: bytesToHex(data),
          left: isLeft
      }
  }
}

module.exports = MerkleTree;
