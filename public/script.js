const BASE_URL = 'https://harvardbks-974c895495ee.herokuapp.com';
let currentDate = new Date();

function loadInventory() {
    fetch(`${BASE_URL}/api/data`)
        .then(response => response.json())
        .then(data => {
            const inventoryTable = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
            inventoryTable.innerHTML = '';
            let totalInventory = 0;

            data.books.forEach((book, index) => {
                const row = inventoryTable.insertRow();
                row.insertCell().textContent = book.title;
                row.insertCell().textContent = book.price.toLocaleString();
                row.insertCell().textContent = book.quantity;
                row.insertCell().textContent = (book.price * book.quantity).toLocaleString();
                totalInventory += book.price * book.quantity;

                const editCell = row.insertCell();
                const editIcon = document.createElement('i');
                editIcon.classList.add('bi', 'bi-pencil-square', 'edit-icon');
                editIcon.style.cursor = 'pointer';
                editIcon.addEventListener('click', () => editBook(index, book.title));
                editCell.appendChild(editIcon);
            });

            document.getElementById('totalInventory').textContent = totalInventory.toLocaleString();
        });
}

function loadTodaysStats(date) {
    fetch(`${BASE_URL}/api/data`)
        .then(response => response.json())
        .then(data => {
            const statsTable = document.getElementById('statsTable').getElementsByTagName('tbody')[0];
            statsTable.innerHTML = '';
            let totalStats = 0;

            data.transactions.filter(transaction => new Date(transaction.timestamp).toDateString() === date.toDateString()).forEach((transaction, index) => {
                const row = statsTable.insertRow();
                row.insertCell().textContent = transaction.action;
                row.insertCell().textContent = transaction.book;
                row.insertCell().textContent = transaction.quantity;
                row.insertCell().textContent = transaction.total.toLocaleString();
                row.insertCell().textContent = transaction.timestamp;

                const deleteCell = row.insertCell();
                if (transaction.action === 'Sold') {
                    totalStats += transaction.total;
                    const deleteIcon = document.createElement('i');
                    deleteIcon.classList.add('bi', 'bi-trash', 'delete-icon');
                    deleteIcon.style.cursor = 'pointer';
                    deleteIcon.addEventListener('click', () => deleteTransaction(index));
                    deleteCell.appendChild(deleteIcon);
                }
            });

            document.getElementById('totalStats').textContent = totalStats.toLocaleString();
            document.getElementById('statsDate').textContent = date.toDateString();
        });
}

document.getElementById('addBookForm').addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
});

document.getElementById('sellBookForm').addEventListener('submit', function (event) {
    event.preventDefault();
    sellBook();
});

function addBook() {
    const title = document.getElementById('bookTitle').value;
    const quantity = parseInt(document.getElementById('quantity').value);

    fetch(`${BASE_URL}/api/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title, price: getPrice(title), quantity: quantity })
    })
        .then(response => response.json())
        .then(() => {
            alert(`${quantity} copies of "${title}" added.`);
            loadInventory();
            addTransaction('Added', title, quantity);
        });
}

function sellBook() {
    const title = document.getElementById('sellBookTitle').value;
    const quantity = parseInt(document.getElementById('sellQuantity').value);

    fetch(`${BASE_URL}/api/data`)
        .then(response => response.json())
        .then(data => {
            const book = data.books.find(book => book.title === title);
            if (!book || book.quantity < quantity) {
                alert('Out of stock');
                return;
            }

            fetch(`${BASE_URL}/api/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: title, price: getPrice(title), quantity: -quantity })
            })
                .then(response => response.json())
                .then(() => {
                    alert(`${quantity} copies of "${title}" sold.`);
                    loadInventory();
                    addTransaction('Sold', title, quantity);
                });
        });
}

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
        "Listening Beginner": 30000,
        "Listening Elementary": 30000,
        "Listening Pre-Intermediate": 30000,
        "Listening Intermediate": 35000
    };
    return prices[title] || 0;
}

function addTransaction(action, title, quantity) {
    const total = getPrice(title) * quantity;
    const timestamp = new Date().toLocaleString();

    fetch(`${BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, book: title, quantity, total, timestamp })
    })
        .then(response => response.json())
        .then(() => {
            loadTodaysStats(currentDate);
        });
}

function editBook(index, title) {
    const password = prompt("Enter password to edit:");
    if (password !== 'Rasul9898aa') {
        alert('Incorrect password');
        return;
    }

    const newQuantity = parseInt(prompt(`Enter new quantity for ${title}:`));
    if (isNaN(newQuantity)) {
        alert('Invalid quantity');
        return;
    }

    fetch(`${BASE_URL}/api/books/${index}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
    })
        .then(response => response.json())
        .then(() => {
            loadInventory();
        });
}

function deleteTransaction(index) {
    const password = prompt("Enter password to delete:");
    if (password !== 'Rasul9898aa') {
        alert('Incorrect password');
        return;
    }

    fetch(`${BASE_URL}/api/transactions/${index}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(() => {
            loadTodaysStats(currentDate);
        });
}

function previousDay() {
    currentDate.setDate(currentDate.getDate() - 1);
    loadTodaysStats(currentDate);
}

function nextDay() {
    currentDate.setDate(currentDate.getDate() + 1);
    loadTodaysStats(currentDate);
}

function exportCurrentInventory() {
    fetch(`${BASE_URL}/api/data`)
        .then(response => response.json())
        .then(data => {
            const csv = convertToCSV(data.books);
            downloadCSV(csv, 'current_inventory.csv');
        });
}

function exportTodaysStatistics() {
    fetch(`${BASE_URL}/api/data`)
        .then(response => response.json())
        .then(data => {
            const csv = convertToCSV(data.transactions.filter(transaction => new Date(transaction.timestamp).toDateString() === currentDate.toDateString()));
            downloadCSV(csv, 'todays_statistics.csv');
        });
}

function convertToCSV(data) {
    const array = [Object.keys(data[0])].concat(data);

    return array.map(row => {
        return Object.values(row).map(value => {
            return typeof value === 'string' ? JSON.stringify(value) : value;
        }).toString();
    }).join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

document.addEventListener('DOMContentLoaded', function () {
    loadInventory();
    loadTodaysStats(currentDate);
});
