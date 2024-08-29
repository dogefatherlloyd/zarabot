import { useState } from 'react';

export default function BlockchainPage() {
    const [walletInfo, setWalletInfo] = useState(null);
    const [transactionMessage, setTransactionMessage] = useState('');
    const [mineMessage, setMineMessage] = useState('');
    const [balanceInfo, setBalanceInfo] = useState('');
    const [adminMessage, setAdminMessage] = useState('');

    const generateWallet = async () => {
        const response = await fetch('/api/generateWallet', { method: 'POST' });
        const wallet = await response.json();
        setWalletInfo(wallet);
    };

    const createTransaction = async (event) => {
        event.preventDefault();
        const fromAddress = event.target.fromAddress.value;
        const privateKey = event.target.privateKey.value;
        const toAddress = event.target.toAddress.value;
        const amount = event.target.amount.value;

        const response = await fetch('/api/createTransaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromAddress, privateKey, toAddress, amount })
        });
        const result = await response.json();
        setTransactionMessage(result.message || result.error);
    };

    const mineBlock = async (event) => {
        event.preventDefault();
        const miningAddress = event.target.miningAddress.value;

        const response = await fetch('/api/mine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ miningAddress })
        });
        const result = await response.json();
        setMineMessage(result.message);
    };

    const checkBalance = async (event) => {
        event.preventDefault();
        const address = event.target.balanceAddress.value;

        const response = await fetch(`/api/balance/${address}`);
        const result = await response.json();
        setBalanceInfo(`Balance: ${result.balance}`);
    };

    const startChain = async () => {
        const response = await fetch('/api/admin/startChain', { method: 'POST' });
        const result = await response.json();
        setAdminMessage(result.message);
    };

    const endChain = async () => {
        const response = await fetch('/api/admin/endChain', { method: 'POST' });
        const result = await response.json();
        setAdminMessage(result.message);
    };

    const clearHistory = async () => {
        const response = await fetch('/api/admin/clearHistory', { method: 'POST' });
        const result = await response.json();
        setAdminMessage(result.message);
    };

    const restartChain = async () => {
        const response = await fetch('/api/admin/restartChain', { method: 'POST' });
        const result = await response.json();
        setAdminMessage(result.message);
    };

    return (
        <div>
            <h1>Blockchain Testing Page</h1>

            <button onClick={generateWallet}>Generate Wallet</button>
            {walletInfo && (
                <div>
                    <p>Public Key: {walletInfo.publicKey}</p>
                    <p>Private Key: {walletInfo.privateKey}</p>
                </div>
            )}

            <form onSubmit={createTransaction}>
                <h2>Create a Transaction</h2>
                <input type="text" id="fromAddress" placeholder="Your Address" required />
                <input type="text" id="privateKey" placeholder="Your Private Key" required />
                <input type="text" id="toAddress" placeholder="Recipient Address" required />
                <input type="number" id="amount" placeholder="Amount" required />
                <button type="submit">Create Transaction</button>
            </form>
            {transactionMessage && <p>{transactionMessage}</p>}

            <form onSubmit={mineBlock}>
                <h2>Mine Block</h2>
                <input type="text" id="miningAddress" placeholder="Your Address" required />
                <button type="submit">Mine Block</button>
            </form>
            {mineMessage && <p>{mineMessage}</p>}

            <form onSubmit={checkBalance}>
                <h2>Check Balance</h2>
                <input type="text" id="balanceAddress" placeholder="Wallet Address" required />
                <button type="submit">Check Balance</button>
            </form>
            {balanceInfo && <p>{balanceInfo}</p>}

            <h2>Admin Operations</h2>
            <button onClick={startChain}>Start Chain</button>
            <button onClick={endChain}>End Chain</button>
            <button onClick={clearHistory}>Clear History</button>
            <button onClick={restartChain}>Restart Chain</button>
            {adminMessage && <p>{adminMessage}</p>}
        </div>
    );
}