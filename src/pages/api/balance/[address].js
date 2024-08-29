import { Blockchain } from '../../../../blockchain';

export default function handler(req, res) {
    const { address } = req.query;
    const blockchain = new Blockchain();

    const balance = blockchain.getBalanceOfAddress(address);
    res.status(200).json({ balance });
}