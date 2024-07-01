const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const dataPath = './data.json';

function readData() {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function writeData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api/data', (req, res) => {
    res.json(readData());
});

app.post('/api/add-book', (req, res) => {
    const { title, quantity, user } = req.body;
    const data = readData();
    const book = data.books.find(book => book.title === title);
    if (book) {
        book.quantity += quantity;
    } else {
        data.books.push({ title, quantity, price: getPrice(title) });
    }
    data.transactions.push({
        action: 'Added',
        book: title,
        quantity,
        total: getPrice(title) * quantity,
        timestamp: new Date().toLocaleString(),
        user,
    });
    writeData(data);
    res.json({ title, quantity });
});

app.post('/api/sell-book', (req, res) => {
    const { title, quantity, paymentType, user } = req.body;
    const data = readData();
    const book = data.books.find(book => book.title === title);
    if (book) {
        if (book.quantity >= quantity) {
            book.quantity -= quantity;
            data.transactions.push({
                action: 'Sold',
                book: title,
                quantity,
                total: getPrice(title) * quantity,
                timestamp: new Date().toLocaleString(),
                paymentType,
                user,
            });
            writeData(data);
            res.json({ title, quantity, success: true });
        } else {
            res.json({ success: false, message: 'Out of stock' });
        }
    } else {
        res.json({ success: false, message: 'Book not found' });
    }
});

app.post('/api/edit-book', (req, res) => {
    const { index, newQuantity } = req.body;
    const data = readData();
    data.books[index].quantity = newQuantity;
    writeData(data);
    res.json({ success: true });
});

app.post('/api/delete-transaction', (req, res) => {
    const { index } = req.body;
    const data = readData();
    data.transactions.splice(index, 1);
    writeData(data);
    res.json({ success: true });
});

app.get('/api/export-inventory', (req, res) => {
    const data = readData();
    const csv = data.books.map(book => `${book.title},${book.quantity},${book.price * book.quantity}`).join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('current_inventory.csv');
    res.send(csv);
});

app.get('/api/export-todays-statistics', (req, res) => {
    const data = readData();
    const today = new Date().toDateString();
    const csv = data.transactions.filter(transaction => new Date(transaction.timestamp).toDateString() === today)
        .map(transaction => `${transaction.action},${transaction.book},${transaction.quantity},${transaction.total},${transaction.timestamp},${transaction.paymentType || ''},${transaction.user}`)
        .join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('todays_statistics.csv');
    res.send(csv);
});

function getPrice(title) {
    const prices = {
        "Beginner": 85000,
        "Elementary": 85000,
        "Pre-Intermediate": 85000,
        "Intermediate": 85000,
        "Kids Level 1": 60000,
        "Kids Level 2": 60000,
        "Kids Level 3": 60000,
        "Kids Level 4": 60000,
        "Kids Level 5": 60000,
        "Kids Level 6": 60000,
        "Kids High Level 1": 60000,
        "Kids High Level 2": 60000,
        "Listening Beginner": 60000,
        "Listening Elementary": 60000,
        "Listening Pre-Intermediate": 60000,
        "Listening Intermediate": 60000
    };
    return prices[title] || 0;
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
