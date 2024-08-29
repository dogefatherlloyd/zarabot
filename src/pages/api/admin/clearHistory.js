import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const blockchainFilePath = path.join(process.cwd(), 'blockchain_data.json');
    const walletsFilePath = path.join(process.cwd(), 'wallets.json');

    try {
        if (fs.existsSync(blockchainFilePath)) {
            fs.unlinkSync(blockchainFilePath);
        }
        if (fs.existsSync(walletsFilePath)) {
            fs.unlinkSync(walletsFilePath);
        }
        res.status(200).json({ message: 'Blockchain history and wallets cleared.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear history and wallets.' });
    }
}