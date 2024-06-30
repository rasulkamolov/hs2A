const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Note: secure should be true in production with HTTPS
}));

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

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = {
        "Dapa": "Kitobchi00",
        "Kids": "Kitobchi99"
    };

    if (users[username] && users[username] === password) {
        req.session.user = username;
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
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
        user
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
                user
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
    const csv = data.transactions.map(transaction => `${transaction.action},${transaction.book},${transaction.quantity},${transaction.total},${transaction.timestamp},${transaction.paymentType},${transaction.user}`).join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('todays_statistics.csv');
    res.send(csv);
});

function getPrice(title) {
    const prices = {
        "Beginner": 10000,
        "Elementary": 11000,
        "Pre-Intermediate": 12000,
        "Intermediate": 13000,
        "Kids Level 1": 9000,
        "Kids Level 2": 9000,
        "Kids Level 3": 9000,
        "Kids Level 4": 9000,
        "Kids Level 5": 9000,
        "Kids Level 6": 9000,
        "Kids High Level 1": 10000,
        "Kids High Level 2": 10000,
        "Listening Beginner": 9500,
        "Listening Elementary": 9500,
        "Listening Pre-Intermediate": 9500,
        "Listening Intermediate": 9500
    };
    return prices[title] || 0;
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
