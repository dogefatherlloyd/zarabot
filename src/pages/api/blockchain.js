import { Blockchain } from '../../../blockchain';

export default function handler(req, res) {
    const blockchain = new Blockchain();
    const wallet = blockchain.generateNewWallet();
    const balance = blockchain.getBalanceOfAddress(wallet.publicKey);

    res.status(200).json({ wallet, balance });
}