document.addEventListener('DOMContentLoaded', () => {
    let currentUser = null;
    let currentDate = new Date();

    const loginForm = document.getElementById('login');
    const loginSection = document.getElementById('loginForm');
    const mainContent = document.getElementById('mainContent');
    const addBookForm = document.getElementById('addBookForm');
    const sellBookForm = document.getElementById('sellBookForm');
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const statisticsTableBody = document.getElementById('statisticsTableBody');
    const inventoryTotal = document.getElementById('inventoryTotal');
    const statisticsTotal = document.getElementById('statisticsTotal');
    const previousDayButton = document.getElementById('previousDay');
    const nextDayButton = document.getElementById('nextDay');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();

        if (result.success) {
            currentUser = username;
            loginSection.style.display = 'none';
            mainContent.style.display = 'block';
            loadInventory();
            loadStatistics(currentDate);
        } else {
            alert('Invalid username or password');
        }
    });

    addBookForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('bookTitle').value;
        const quantity = parseInt(document.getElementById('quantity').value, 10);

        const response = await fetch('/api/add-book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, quantity, user: currentUser })
        });
        const result = await response.json();

        if (result.title) {
            alert(`${quantity} copies of "${result.title}" added.`);
            loadInventory();
            loadStatistics(currentDate);
        } else {
            alert('Error adding book.');
        }
    });

    sellBookForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('sellBookTitle').value;
        const quantity = parseInt(document.getElementById('sellQuantity').value, 10);
        const paymentType = document.getElementById('paymentType').value;

        const response = await fetch('/api/sell-book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, quantity, paymentType, user: currentUser })
        });
        const result = await response.json();

        if (result.success) {
            alert(`${quantity} copies of "${title}" sold.`);
            loadInventory();
            loadStatistics(currentDate);
        } else {
            alert(result.message || 'Error selling book.');
        }
    });

    previousDayButton.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        loadStatistics(currentDate);
    });

    nextDayButton.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        loadStatistics(currentDate);
    });

    async function loadInventory() {
        const response = await fetch('/api/data');
        const data = await response.json();

        inventoryTableBody.innerHTML = '';
        let total = 0;

        data.books.forEach((book, index) => {
            total += book.price * book.quantity;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.quantity}</td>
                <td>${(book.price * book.quantity).toLocaleString()}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-book" data-index="${index}">&#9998;</button>
                </td>
            `;
            inventoryTableBody.appendChild(row);
        });

        inventoryTotal.innerText = total.toLocaleString();

        document.querySelectorAll('.edit-book').forEach(button => {
            button.addEventListener('click', async (event) => {
                const index = event.target.dataset.index;
                const newQuantity = prompt('Enter new quantity:');
                const password = prompt('Enter password:');

                if (password === 'Rasul9898aa') {
                    await fetch('/api/edit-book', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ index, newQuantity: parseInt(newQuantity, 10) })
                    });
                    loadInventory();
                } else {
                    alert('Invalid password.');
                }
            });
        });
    }

    async function loadStatistics(date) {
        const response = await fetch('/api/data');
        const data = await response.json();
        const formattedDate = date.toLocaleDateString();

        statisticsTableBody.innerHTML = '';
        let totalSold = 0;

        data.transactions.forEach((transaction, index) => {
            const transactionDate = new Date(transaction.timestamp).toLocaleDateString();
            if (transactionDate === formattedDate) {
                if (transaction.action === 'Sold') {
                    totalSold += transaction.total;
                }
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.action}</td>
                    <td>${transaction.book}</td>
                    <td>${transaction.quantity}</td>
                    <td>${transaction.total.toLocaleString()}</td>
                    <td>${transaction.timestamp}</td>
                    <td>${transaction.paymentType}</td>
                    <td>${transaction.user}</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-transaction" data-index="${index}">&#128465;</button>
                    </td>
                `;
                statisticsTableBody.appendChild(row);
            }
        });

        statisticsTotal.innerText = totalSold.toLocaleString();

        document.querySelectorAll('.delete-transaction').forEach(button => {
            button.addEventListener('click', async (event) => {
                const index = event.target.dataset.index;
                const password = prompt('Enter password:');

                if (password === 'Rasul9898aa') {
                    await fetch('/api/delete-transaction', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ index })
                    });
                    loadStatistics(currentDate);
                } else {
                    alert('Invalid password.');
                }
            });
        });
    }
});
