import { Blockchain } from '../../../blockchain';

export default function handler(req, res) {
    const { miningAddress } = req.body;
    const blockchain = new Blockchain();

    blockchain.minePendingTransactions(miningAddress);
    res.status(200).json({ message: 'Block successfully mined.' });
}