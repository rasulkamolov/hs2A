const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const dbFilePath = path.join(__dirname, 'db.json');

if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify({ books: [], transactions: [] }));
}

function readDatabase() {
    return JSON.parse(fs.readFileSync(dbFilePath));
}

function writeDatabase(data) {
    fs.writeFileSync(dbFilePath, JSON.stringify(data));
}

app.get('/api/data', (req, res) => {
    res.json(readDatabase());
});

app.post('/api/books', (req, res) => {
    const db = readDatabase();
    const bookIndex = db.books.findIndex(book => book.title === req.body.title);
    
    if (bookIndex !== -1) {
        db.books[bookIndex].quantity += req.body.quantity;
    } else {
        db.books.push(req.body);
    }
    
    writeDatabase(db);
    res.json({ success: true });
});

app.put('/api/books/:index', (req, res) => {
    const db = readDatabase();
    const index = parseInt(req.params.index);
    if (db.books[index]) {
        db.books[index].quantity = req.body.quantity;
        writeDatabase(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

app.post('/api/transactions', (req, res) => {
    const db = readDatabase();
    db.transactions.push(req.body);
    writeDatabase(db);
    res.json({ success: true });
});

app.delete('/api/transactions/:index', (req, res) => {
    const db = readDatabase();
    const index = parseInt(req.params.index);
    if (db.transactions[index]) {
        db.transactions.splice(index, 1);
        writeDatabase(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Transaction not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
