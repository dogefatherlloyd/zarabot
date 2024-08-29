import { useState, useEffect } from 'react';

export default function BlockchainPage() {
    const [blockchainData, setBlockchainData] = useState(null);

    useEffect(() => {
        async function fetchBlockchainData() {
            const response = await fetch('/api/blockchain');
            const data = await response.json();
            setBlockchainData(data);
        }
        fetchBlockchainData();
    }, []);

    const handleMineTransactions = async () => {
        const response = await fetch('/api/mine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publicKey: blockchainData.wallet.publicKey }),
        });
        const updatedData = await response.json();
        setBlockchainData(updatedData);
    };

    const handleCreateTransaction = async (toAddress, amount) => {
        const response = await fetch('/api/transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fromAddress: blockchainData.wallet.publicKey,
                toAddress,
                amount,
                privateKey: blockchainData.wallet.privateKey,
            }),
        });
        const updatedData = await response.json();
        setBlockchainData(updatedData);
    };

    return (
        <div>
            <h1>Blockchain Testing Page</h1>
            {blockchainData && (
                <div>
                    <p>Wallet Address: {blockchainData.wallet.publicKey}</p>
                    <p>Balance: {blockchainData.balance}</p>
                </div>
            )}
            <button onClick={handleMineTransactions}>Mine Transactions</button>
            <div>
                <h2>Create a Transaction</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const toAddress = e.target.toAddress.value;
                    const amount = e.target.amount.value;
                    handleCreateTransaction(toAddress, amount);
                }}>
                    <input type="text" name="toAddress" placeholder="Recipient Address" required />
                    <input type="number" name="amount" placeholder="Amount" required />
                    <button type="submit">Create Transaction</button>
                </form>
            </div>
        </div>
    );
}