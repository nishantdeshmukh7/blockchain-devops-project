const Blockchain = require('./blockchain');

const blockchain = new Blockchain();

const ipfsHash = process.argv[2];

if (!ipfsHash) {
    console.log("❌ No IPFS hash provided");
    process.exit(1);
}

blockchain.addBlock({ ipfsHash });

// Print full blockchain
blockchain.printChain();