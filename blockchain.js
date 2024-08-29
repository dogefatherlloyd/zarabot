const fs = require('fs');
const crypto = require('crypto');
const EC = require('elliptic').ec;
const BigNumber = require('bignumber.js');
const ec = new EC('secp256k1');

// Class for handling transactions
class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = new BigNumber(amount);  // Store amount as a BigNumber
        this.signature = '';
    }

    calculateHash() {
        return crypto.createHash('sha256')
            .update(this.fromAddress + this.toAddress + this.amount.toString())
            .digest('hex');
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.fromAddress === null) return true; // Mining rewards do not require signatures

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

// Class for handling individual blocks
class Block {
    constructor(index, timestamp, transactions, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto.createHash('sha256')
            .update(this.index + this.timestamp + JSON.stringify(this.transactions) + this.previousHash)
            .digest('hex');
    }

    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
}

// Blockchain class that manages the chain and mining
class Blockchain {
    constructor(blockchainFile = 'blockchain_data.json') {
        this.blockchainFile = blockchainFile;
        const data = this.loadBlockchainFromFile();

        if (data && data.chain.length > 0) {
            this.chain = data.chain.map(blockData => this.restoreBlock(blockData));
            this.pendingTransactions = data.pendingTransactions.map(txData => this.restoreTransaction(txData));
            console.log('Blockchain loaded from file:', this.blockchainFile);
        } else {
            this.chain = [this.createGenesisBlock()];
            this.pendingTransactions = [];
            console.log('Genesis block created.');
        }

        this.miningReward = new BigNumber(100);  // Use BigNumber for mining reward
        this.saveBlockchainToFile();
    }

    createGenesisBlock() {
        return new Block(0, new Date().toISOString(), [], '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        const block = new Block(this.chain.length, new Date().toISOString(), this.pendingTransactions, this.getLatestBlock().hash);

        if (!block.hasValidTransactions()) {
            throw new Error('Block contains invalid transactions.');
        }

        this.chain.push(block);
        this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)];
        this.saveBlockchainToFile();
    }

    createTransaction(transaction) {
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to the chain');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = new BigNumber(0);  // Use BigNumber for balance

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance = balance.minus(trans.amount);
                }
                if (trans.toAddress === address) {
                    balance = balance.plus(trans.amount);
                }
            }
        }

        return balance.toNumber();  // Convert to regular number for output
    }

    saveBlockchainToFile() {
        const blockchainData = {
            chain: this.chain,
            pendingTransactions: this.pendingTransactions
        };
        fs.writeFileSync(this.blockchainFile, JSON.stringify(blockchainData, null, 4));
    }

    loadBlockchainFromFile() {
        try {
            if (fs.existsSync(this.blockchainFile)) {
                const data = fs.readFileSync(this.blockchainFile, 'utf8');
                if (data.trim() === "") {
                    return null;  // Return null for empty file
                }
                return JSON.parse(data); // Parse JSON if file contains data
            }
        } catch (error) {
            console.error('Error loading blockchain data:', error);
        }
        return null; // Return null for any error
    }

    restoreBlock(blockData) {
        const restoredTransactions = blockData.transactions.map(txData => this.restoreTransaction(txData));
        return new Block(blockData.index, blockData.timestamp, restoredTransactions, blockData.previousHash);
    }

    restoreTransaction(txData) {
        const restoredTransaction = new Transaction(txData.fromAddress, txData.toAddress, new BigNumber(txData.amount));
        restoredTransaction.signature = txData.signature;
        return restoredTransaction;
    }

    generateNewWallet() {
        const key = ec.genKeyPair();
        const publicKey = key.getPublic('hex');
        const privateKey = key.getPrivate('hex');

        const wallet = { publicKey, privateKey };
        this.saveWallet(wallet);
        return wallet;
    }

    saveWallet(wallet) {
        const walletsFile = 'wallets.json';
        let wallets = [];

        if (fs.existsSync(walletsFile)) {
            const walletData = fs.readFileSync(walletsFile, 'utf8');
            if (walletData.trim() !== "") {
                wallets = JSON.parse(walletData);
            }
        }

        wallets.push(wallet);
        fs.writeFileSync(walletsFile, JSON.stringify(wallets, null, 4));
    }
}

module.exports = { Blockchain, Transaction };