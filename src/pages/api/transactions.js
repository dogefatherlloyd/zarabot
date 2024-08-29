import { Blockchain, Transaction, ec } from '../../../blockchain';

export default function handler(req, res) {
    const { fromAddress, toAddress, amount, privateKey } = req.body;
    const blockchain = new Blockchain();

    const tx = new Transaction(fromAddress, toAddress, amount);
    tx.signTransaction(ec.keyFromPrivate(privateKey));
    blockchain.createTransaction(tx);

    blockchain.minePendingTransactions(fromAddress);
    const balance = blockchain.getBalanceOfAddress(fromAddress);

    res.status(200).json({ wallet: { publicKey: fromAddress }, balance });
}