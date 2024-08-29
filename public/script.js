// Generate a new wallet
async function generateWallet() {
    const response = await fetch('/generateWallet', {
        method: 'POST'
    });
    const wallet = await response.json();
    document.getElementById('walletInfo').innerText = `Public Key: ${wallet.publicKey}\nPrivate Key: ${wallet.privateKey}`;
}

// Create a transaction
async function createTransaction(event) {
    event.preventDefault();
    const fromAddress = document.getElementById('fromAddress').value;
    const privateKey = document.getElementById('privateKey').value;
    const toAddress = document.getElementById('toAddress').value;
    const amount = document.getElementById('amount').value;

    const response = await fetch('/createTransaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fromAddress, privateKey, toAddress, amount })
    });
    const result = await response.json();
    document.getElementById('transactionMessage').innerText = result.message || result.error;
}

// Mine a block
async function mineBlock(event) {
    event.preventDefault();
    const miningAddress = document.getElementById('miningAddress').value;

    const response = await fetch('/mine', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ miningAddress })
    });
    const result = await response.json();
    document.getElementById('mineMessage').innerText = result.message;
}

// Check the balance of a wallet
async function checkBalance(event) {
    event.preventDefault();
    const address = document.getElementById('balanceAddress').value;

    const response = await fetch(`/balance/${address}`);
    const result = await response.json();
    document.getElementById('balanceInfo').innerText = `Balance: ${result.balance}`;
}

// Start a new chain
async function startChain() {
    const response = await fetch('/admin/startChain', {
        method: 'POST'
    });
    const result = await response.json();
    document.getElementById('adminMessage').innerText = result.message;
}

// End the current chain
async function endChain() {
    const response = await fetch('/admin/endChain', {
        method: 'POST'
    });
    const result = await response.json();
    document.getElementById('adminMessage').innerText = result.message;
}

// Clear all history and wallets
async function clearHistory() {
    const response = await fetch('/admin/clearHistory', {
        method: 'POST'
    });
    const result = await response.json();
    document.getElementById('adminMessage').innerText = result.message;
}

// Restart the chain
async function restartChain() {
    const response = await fetch('/admin/restartChain', {
        method: 'POST'
    });
    const result = await response.json();
    document.getElementById('adminMessage').innerText = result.message;
}