// Start a new chain
async function startChain() {
    try {
        const response = await fetch('/admin/startChain', {
            method: 'POST'
        });
        const result = await response.json();
        console.log('startChain response:', result); // Log the result
        document.getElementById('adminMessage').innerText = result.message;
    } catch (error) {
        console.error('Error in startChain:', error); // Log any errors
    }
}

// End the current chain
async function endChain() {
    try {
        const response = await fetch('/admin/endChain', {
            method: 'POST'
        });
        const result = await response.json();
        console.log('endChain response:', result); // Log the result
        document.getElementById('adminMessage').innerText = result.message;
    } catch (error) {
        console.error('Error in endChain:', error); // Log any errors
    }
}

// Clear all history and wallets
async function clearHistory() {
    try {
        const response = await fetch('/admin/clearHistory', {
            method: 'POST'
        });
        const result = await response.json();
        console.log('clearHistory response:', result); // Log the result
        document.getElementById('adminMessage').innerText = result.message;
    } catch (error) {
        console.error('Error in clearHistory:', error); // Log any errors
    }
}

// Restart the chain
async function restartChain() {
    try {
        const response = await fetch('/admin/restartChain', {
            method: 'POST'
        });
        const result = await response.json();
        console.log('restartChain response:', result); // Log the result
        document.getElementById('adminMessage').innerText = result.message;
    } catch (error) {
        console.error('Error in restartChain:', error); // Log any errors
    }
}