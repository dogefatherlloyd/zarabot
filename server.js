const express = require('express');
const { Blockchain, Transaction } = require('./blockchain');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Firebase Admin SDK setup
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Firestore reference
const db = admin.firestore();

const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let myCoin = new Blockchain();

// Serve the user interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the admin interface
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin routes
app.post('/admin/startChain', async (req, res) => {
    try {
        fs.writeFileSync('blockchain_data.json', ''); // Clear blockchain data file
        fs.writeFileSync('wallets.json', ''); // Clear wallet data file
        myCoin = new Blockchain(); // Reinitialize the blockchain instance
        await saveBlockchainToFirestore(myCoin); // Save new chain to Firestore
        res.json({ message: 'New chain started successfully.' });
    } catch (error) {
        console.error('Error starting new chain:', error);
        res.status(500).json({ error: 'Error starting the new chain.' });
    }
});

app.post('/admin/endChain', async (req, res) => {
    try {
        myCoin.saveBlockchainToFile(); // Save the current blockchain state
        await saveBlockchainToFirestore(myCoin); // Save blockchain to Firestore
        res.json({ message: 'Current chain ended successfully.' });
    } catch (error) {
        console.error('Error ending the chain:', error);
        res.status(500).json({ error: 'Error ending the current chain.' });
    }
});

app.post('/admin/clearHistory', async (req, res) => {
    try {
        fs.writeFileSync('blockchain_data.json', ''); // Clear blockchain data
        fs.writeFileSync('wallets.json', ''); // Clear wallet data
        await clearFirestoreData(); // Clear Firestore data
        res.json({ message: 'All history and wallets cleared successfully.' });
    } catch (error) {
        console.error('Error clearing history and wallets:', error);
        res.status(500).json({ error: 'Error clearing history and wallets.' });
    }
});

app.post('/admin/restartChain', async (req, res) => {
    try {
        fs.writeFileSync('blockchain_data.json', ''); // Clear blockchain data
        fs.writeFileSync('wallets.json', ''); // Clear wallet data
        myCoin = new Blockchain(); // Reinitialize the blockchain instance
        await saveBlockchainToFirestore(myCoin); // Save new chain to Firestore
        res.json({ message: 'Chain restarted successfully.' });
    } catch (error) {
        console.error('Error restarting the chain:', error);
        res.status(500).json({ error: 'Error restarting the chain.' });
    }
});

// Generate a new wallet and save to Firestore
app.post('/generateWallet', async (req, res) => {
    try {
        const wallet = myCoin.generateNewWallet();
        await saveWalletToFirestore(wallet);  // Save wallet data to Firestore
        res.json(wallet);
    } catch (error) {
        console.error('Error generating wallet:', error);
        res.status(500).json({ error: 'Error generating wallet.' });
    }
});

// Get balance for a given address
app.get('/balance/:address', (req, res) => {
    try {
        const address = req.params.address;
        const balance = myCoin.getBalanceOfAddress(address);
        res.json({ balance });
    } catch (error) {
        console.error('Error retrieving balance:', error);
        res.status(500).json({ error: 'Error retrieving balance.' });
    }
});

// Create a new transaction and save to Firestore
app.post('/createTransaction', async (req, res) => {
    try {
        const { fromAddress, toAddress, amount, privateKey } = req.body;

        // Validate inputs
        if (!fromAddress || !toAddress || !amount || !privateKey) {
            throw new Error('Missing transaction fields.');
        }

        // Use elliptic to get the key from the private key
        const key = ec.keyFromPrivate(privateKey);

        // Create a new transaction
        const transaction = new Transaction(fromAddress, toAddress, amount);

        // Sign the transaction with the private key
        transaction.signTransaction(key);

        // Add the transaction to the blockchain
        myCoin.createTransaction(transaction);

        await saveBlockchainToFirestore(myCoin);  // Save updated blockchain to Firestore

        res.json({ message: 'Transaction added successfully' });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(400).json({ error: error.message });
    }
});

// Mine pending transactions and save to Firestore
app.post('/mine', async (req, res) => {
    try {
        const { miningAddress } = req.body;

        if (!miningAddress) {
            throw new Error('Mining address is required.');
        }

        // Mine the pending transactions
        myCoin.minePendingTransactions(miningAddress);

        await saveBlockchainToFirestore(myCoin);  // Save updated blockchain to Firestore

        res.json({ message: 'Block mined successfully' });
    } catch (error) {
        console.error('Error mining block:', error);
        res.status(500).json({ error: error.message });
    }
});

// Save blockchain data to Firestore
async function saveBlockchainToFirestore(blockchain) {
    try {
        const docRef = db.collection('blockchain').doc('chainData');
        await docRef.set({
            chain: blockchain.chain,
            pendingTransactions: blockchain.pendingTransactions,
            timestamp: new Date().toISOString()
        });
        console.log('Blockchain data successfully written to Firestore!');
    } catch (error) {
        console.error('Error writing blockchain data to Firestore:', error);
    }
}

// Save wallet data to Firestore
async function saveWalletToFirestore(wallet) {
    try {
        const docRef = db.collection('wallets').doc(wallet.publicKey);
        await docRef.set({
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            createdAt: new Date().toISOString()
        });
        console.log('Wallet data successfully written to Firestore!');
    } catch (error) {
        console.error('Error writing wallet data to Firestore:', error);
    }
}

// Clear all blockchain and wallet data from Firestore
async function clearFirestoreData() {
    try {
        const blockchainRef = db.collection('blockchain').doc('chainData');
        await blockchainRef.delete();
        console.log('Blockchain data cleared from Firestore.');

        const walletsRef = db.collection('wallets');
        const walletsSnapshot = await walletsRef.get();
        const batch = db.batch();
        walletsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('Wallets cleared from Firestore.');
    } catch (error) {
        console.error('Error clearing Firestore data:', error);
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Blockchain app listening at http://localhost:${port}`);
});