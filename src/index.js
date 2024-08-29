const express = require('express');
const { Blockchain, Transaction } = require('./blockchain');
const SecurityAI = require('./SecurityAI');  // AI integration
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let myCoin = new Blockchain();

// Placeholder code to avoid ESLint errors
console.log(Transaction);
console.log(SecurityAI);
console.log(myCoin);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});