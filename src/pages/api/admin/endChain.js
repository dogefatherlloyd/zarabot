import { Blockchain } from '../../../../blockchain';

export default function handler(req, res) {
    const blockchain = new Blockchain();
    blockchain.chain = [];
    blockchain.pendingTransactions = [];
    blockchain.saveBlockchainToFile();

    res.status(200).json({ message: 'Blockchain ended.' });
}