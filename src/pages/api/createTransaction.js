import { Blockchain, Transaction, ec } from '../../../blockchain';

export default function handler(req, res) {
    const { fromAddress, privateKey, toAddress, amount } = req.body;
    const blockchain = new Blockchain();

    try {
        const tx = new Transaction(fromAddress, toAddress, amount);
        tx.signTransaction(ec.keyFromPrivate(privateKey));
        blockchain.createTransaction(tx);

        blockchain.minePendingTransactions(fromAddress);
        res.status(200).json({ message: 'Transaction successfully created and mined.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}