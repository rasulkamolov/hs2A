document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const addBookForm = document.getElementById('addBookForm');
    const sellBookForm = document.getElementById('sellBookForm');
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const statisticsTableBody = document.getElementById('statisticsTableBody');
    const inventoryTotal = document.getElementById('inventoryTotal');
    const statisticsTotal = document.getElementById('statisticsTotal');
    const previousDayButton = document.getElementById('previousDay');
    const nextDayButton = document.getElementById('nextDay');
    const loginSection = document.getElementById('login-section');
    const inventorySection = document.getElementById('inventory-section');
    const statisticsSection = document.getElementById('statistics-section');
    let currentUser = null;
    let currentDate = new Date();

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
            inventorySection.style.display = 'block';
            statisticsSection.style.display = 'block';
            loadInventory();
            loadStatistics(currentDate);
        } else {
            alert('Invalid username or password');
        }
    });

    addBookForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('bookTitle').value;
        const quantity = parseInt(document.getElementById('quantity').value);

        const response = await fetch('/api/add-book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, quantity, user: currentUser })
        });

        const result = await response.json();
        if (result.success) {
            alert(`Added ${quantity} copies of ${title}`);
            loadInventory();
        } else {
            alert('Failed to add book');
        }
    });

    sellBookForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('sellBookTitle').value;
        const quantity = parseInt(document.getElementById('sellQuantity').value);
        const paymentType = document.getElementById('paymentType').value;

        const response = await fetch('/api/sell-book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, quantity, paymentType, user: currentUser })
        });

        const result = await response.json();
        if (result.success) {
            alert(`Sold ${quantity} copies of ${title}`);
            loadStatistics(currentDate);
        } else {
            alert(result.message);
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
        const response = await fetch('/api/inventory');
        const inventory = await response.json();
        inventoryTableBody.innerHTML = '';
        let total = 0;

        inventory.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.title}</td>
                <td>${item.quantity}</td>
                <td>${item.quantity * 100}</td>
                <td><button class="btn btn-warning btn-edit">✎</button></td>
            `;
            inventoryTableBody.appendChild(row);
            total += item.quantity * 100;
        });

        inventoryTotal.textContent = total;
    }

    async function loadStatistics(date) {
        const formattedDate = date.toISOString().split('T')[0];
        const response = await fetch(`/api/statistics?date=${formattedDate}`);
        const statistics = await response.json();
        statisticsTableBody.innerHTML = '';
        let totalSold = 0;

        statistics.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.action}</td>
                <td>${item.title}</td>
                <td>${item.quantity}</td>
                <td>${item.quantity * 100}</td>
                <td>${item.date}</td>
                <td>${item.paymentType}</td>
                <td>${item.user}</td>
                <td><button class="btn btn-danger btn-delete">🗑</button></td>
            `;
            statisticsTableBody.appendChild(row);
            if (item.action === 'sold') {
                totalSold += item.quantity * 100;
            }
        });

        statisticsTotal.textContent = totalSold;
    }
});
