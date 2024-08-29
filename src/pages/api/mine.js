import { Blockchain } from '../../../blockchain';

export default function handler(req, res) {
    const { publicKey } = req.body;
    const blockchain = new Blockchain();
    blockchain.minePendingTransactions(publicKey);
    const balance = blockchain.getBalanceOfAddress(publicKey);

    res.status(200).json({ wallet: { publicKey }, balance });
}