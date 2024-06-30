const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

let inventory = [
    { title: "Beginner", quantity: 0, price: 85000 },
    { title: "Elementary", quantity: 0, price: 85000 },
    { title: "Pre-Intermediate", quantity: 0, price: 85000 },
    { title: "Intermediate", quantity: 0, price: 85000 },
    { title: "Kids Level 1", quantity: 0, price: 60000 },
    { title: "Kids Level 2", quantity: 0, price: 60000 },
    { title: "Kids Level 3", quantity: 0, price: 60000 },
    { title: "Kids Level 4", quantity: 0, price: 60000 },
    { title: "Kids Level 5", quantity: 0, price: 60000 },
    { title: "Kids Level 6", quantity: 0, price: 60000 },
    { title: "Kids High Level 1", quantity: 0, price: 60000 },
    { title: "Kids High Level 2", quantity: 0, price: 60000 },
    { title: "Listening Beginner", quantity: 0, price: 30000 },
    { title: "Listening Elementary", quantity: 0, price: 30000 },
    { title: "Listening Pre-Intermediate", quantity: 0, price: 30000 },
    { title: "Listening Intermediate", quantity: 0, price: 35000 }
];

let transactions = [];

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'bookinventorysecret', resave: false, saveUninitialized: true }));

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const validUsers = {
        Dapa: 'Kitobchi00',
        Kids: 'Kitobchi99'
    };

    if (validUsers[username] === password) {
        req.session.user = username;
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.post('/api/add-book', (req, res) => {
    const { title, quantity, user } = req.body;

    const book = inventory.find(b => b.title === title);
    if (book) {
        book.quantity += quantity;
        transactions.push({
            action: 'Added',
            title,
            quantity,
            price: book.price,
            timestamp: new Date(),
            user
        });
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Book not found' });
    }
});

app.post('/api/sell-book', (req, res) => {
    const { title, quantity, paymentType, user } = req.body;

    const book = inventory.find(b => b.title === title);
    if (book) {
        if (book.quantity >= quantity) {
            book.quantity -= quantity;
            transactions.push({
                action: 'Sold',
                title,
                quantity,
                price: book.price,
                paymentType,
                timestamp: new Date(),
                user
            });
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Out of stock' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Book not found' });
    }
});

app.post('/api/statistics', (req, res) => {
    const { date } = req.body;
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.timestamp);
        transactionDate.setHours(0, 0, 0, 0);
        return transactionDate.getTime() === requestedDate.getTime();
    });

    res.json(filteredTransactions);
});

app.post('/api/edit-inventory', (req, res) => {
    const { index, quantity } = req.body;

    if (index >= 0 && index < inventory.length) {
        inventory[index].quantity = parseInt(quantity);
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

app.post('/api/delete-transaction', (req, res) => {
    const { index } = req.body;

    if (index >= 0 && index < transactions.length) {
        transactions.splice(index, 1);
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

app.get('/api/inventory', (req, res) => {
    res.json(inventory);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
