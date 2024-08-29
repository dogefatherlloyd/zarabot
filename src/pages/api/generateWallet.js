import { Blockchain } from '../../../blockchain';

export default function handler(req, res) {
    const blockchain = new Blockchain();
    const wallet = blockchain.generateNewWallet();
    res.status(200).json(wallet);
}