const BASE_URL = 'https://kitobchi-d505dd994d30.herokuapp.com';

let currentDate = new Date();
let currentUser = null;

function updateDateDisplay() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDateDisplay').innerText = currentDate.toLocaleDateString(undefined, options);
}

function loadInventory() {
    fetch(`${BASE_URL}/api/data`)
        .then(response => response.json())
        .then(data => {
            const inventoryTableBody = document.querySelector('#inventoryTable tbody');
            inventoryTableBody.innerHTML = '';

            let totalValue = 0;

            data.books.forEach((book, index) => {
                const row = document.createElement('tr');
                const total = book.price * book.quantity;
                totalValue += total;

                row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.quantity}</td>
                    <td>${total.toLocaleString()}</td>
                    <td><button class="btn btn-primary btn-sm" onclick="editBook(${index}, '${book.title}')"><i class="fas fa-pen"></i></button></td>
                `;

                inventoryTableBody.appendChild(row);
            });

            const totalRow = document.createElement('tr');
            totalRow.innerHTML = `
                <td colspan="2"><strong>Total Value</strong></td>
                <td colspan="2"><strong>${totalValue.toLocaleString()} UZS</strong></td>
            `;
            inventoryTableBody.appendChild(totalRow);
        });
}

function loadTodaysStats(date) {
    fetch(`${BASE_URL}/api/data`)
        .then(response => response.json())
        .then(data => {
            const statsTableBody = document.querySelector('#todaysStatsTable tbody');
            statsTableBody.innerHTML = '';

            const filteredTransactions = data.transactions.filter(transaction => {
                return new Date(transaction.timestamp).toDateString() === date.toDateString();
            });

            let totalSales = 0;
            let addedBooks = 0;

            filteredTransactions.forEach((transaction, index) => {
                const row = document.createElement('tr');
                if (transaction.action === 'Sold') {
                    totalSales += transaction.total;
                } else if (transaction.action === 'Added') {
                    addedBooks += transaction.quantity;
                }

                row.innerHTML = `
                    <td>${transaction.action}</td>
                    <td>${transaction.book}</td>
                    <td>${transaction.quantity}</td>
                    <td>${transaction.total.toLocaleString()}</td>
                    <td>${transaction.timestamp}</td>
                    <td>${transaction.paymentType || ''}</td>
                    <td>${transaction.user}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteTransaction(${index})"><i class="fas fa-trash"></i></button></td>
                `;

                statsTableBody.appendChild(row);
            });

            const totalRow = document.createElement('tr');
            totalRow.innerHTML = `
                <td colspan="2"><strong>Total Sales</strong></td>
                <td colspan="6"><strong>${totalSales.toLocaleString()} UZS</strong></td>
            `;
            statsTableBody.appendChild(totalRow);

            const addedRow = document.createElement('tr');
            addedRow.innerHTML = `
                <td colspan="2"><strong>Total Books Added</strong></td>
                <td colspan="6"><strong>${addedBooks}</strong></td>
            `;
            statsTableBody.appendChild(addedRow);
        });
}

document.getElementById('addBookForm').addEventListener('submit', function (e) {
    e.preventDefault();
    addBook();
});

document.getElementById('sellBookForm').addEventListener('submit', function (e) {
    e.preventDefault();
    sellBook();
});

document.getElementById('login').addEventListener('submit', function (e) {
    e.preventDefault();
    login();
});

function addBook() {
    const title = document.getElementById('bookTitle').value;
    const quantity = parseInt(document.getElementById('quantity').value);

    fetch(`${BASE_URL}/api/add-book`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, quantity, user: currentUser }),
    })
        .then(response => response.json())
        .then(data => {
            alert(`${data.quantity} copies of "${data.title}" added.`);
            loadInventory();
            loadTodaysStats(currentDate);
        });
}

function sellBook() {
    const title = document.getElementById('sellBookTitle').value;
    const quantity = parseInt(document.getElementById('sellQuantity').value);
    const paymentType = document.getElementById('paymentType').value;

    fetch(`${BASE_URL}/api/sell-book`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, quantity, paymentType, user: currentUser }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`${data.quantity} copies of "${data.title}" sold.`);
            } else {
                alert(`Error: ${data.message}`);
            }
            loadInventory();
            loadTodaysStats(currentDate);
        });
}

function editBook(index, title) {
    const password = prompt("Enter password to edit:");
    if (password === 'Rasul9898aa') {
        const newQuantity = prompt(`Enter new quantity for ${title}:`);
        if (newQuantity !== null) {
            fetch(`${BASE_URL}/api/edit-book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ index, newQuantity: parseInt(newQuantity) }),
            })
                .then(response => response.json())
                .then(data => {
                    loadInventory();
                    loadTodaysStats(currentDate);
                });
        }
    } else {
        alert('Incorrect password.');
    }
}

function deleteTransaction(index) {
    const password = prompt("Enter password to delete:");
    if (password === 'Rasul9898aa') {
        fetch(`${BASE_URL}/api/delete-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ index }),
        })
            .then(response => response.json())
            .then(data => {
                loadTodaysStats(currentDate);
            });
    } else {
        alert('Incorrect password.');
    }
}

function exportCurrentInventory() {
    fetch(`${BASE_URL}/api/export-inventory`)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'current_inventory.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
}

function exportTodaysStatistics() {
    fetch(`${BASE_URL}/api/export-todays-statistics`)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'todays_statistics.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
}

function previousDay() {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    loadTodaysStats(currentDate);
}

function nextDay() {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    loadTodaysStats(currentDate);
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = username;
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                loadInventory();
                loadTodaysStats(currentDate);
            } else {
                alert('Incorrect username or password.');
            }
        });
}

document.addEventListener('DOMContentLoaded', function () {
    updateDateDisplay();
});
