const crypto = require('crypto');
const fs = require('fs');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(this.index + this.timestamp + JSON.stringify(this.data) + this.previousHash)
            .digest('hex');
    }
}

class Blockchain {
    constructor() {
        this.chain = this.loadChain();
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), "Genesis Block", "0");
    }

    loadChain() {
        if (fs.existsSync('blockchain.json')) {
            const data = fs.readFileSync('blockchain.json');
            return JSON.parse(data);
        } else {
            return [this.createGenesisBlock()];
        }
    }

    saveChain() {
        fs.writeFileSync('blockchain.json', JSON.stringify(this.chain, null, 2));
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        const newBlock = new Block(
            this.chain.length,
            Date.now(),
            data,
            this.getLatestBlock().hash
        );

        this.chain.push(newBlock);
        this.saveChain();

        console.log("\n✅ Block added successfully!\n");
        console.log(newBlock);
    }

    printChain() {
        console.log("\n📦 FULL BLOCKCHAIN:\n");
        console.log(JSON.stringify(this.chain, null, 2));
    }
}

module.exports = Blockchain;