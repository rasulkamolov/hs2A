const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

let inventory = [];
let statistics = [];

const users = {
    Dapa: 'Kitobchi00',
    Kids: 'Kitobchi99'
};

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] === password) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.post('/api/add-book', (req, res) => {
    const { title, quantity, user } = req.body;
    const book = inventory.find(item => item.title === title);

    if (book) {
        book.quantity += quantity;
    } else {
        inventory.push({ title, quantity });
    }

    const date = new Date().toISOString().split('T')[0];
    statistics.push({ action: 'added', title, quantity, date, user, paymentType: '' });

    res.json({ success: true });
});

app.post('/api/sell-book', (req, res) => {
    const { title, quantity, paymentType, user } = req.body;
    const book = inventory.find(item => item.title === title);

    if (book) {
        if (book.quantity >= quantity) {
            book.quantity -= quantity;
            const date = new Date().toISOString().split('T')[0];
            statistics.push({ action: 'sold', title, quantity, date, user, paymentType });
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Out of stock' });
        }
    } else {
        res.json({ success: false, message: 'Book not found' });
    }
});

app.get('/api/inventory', (req, res) => {
    res.json(inventory);
});

app.get('/api/statistics', (req, res) => {
    const { date } = req.query;
    const filteredStatistics = statistics.filter(item => item.date === date);
    res.json(filteredStatistics);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
