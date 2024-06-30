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
        const quantity = parseInt(document.getElementById('quantity').value);

        const response = await fetch('/api/add-book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, quantity, user: currentUser })
        });

        if (response.ok) {
            alert(`Added ${quantity} copies of ${title}`);
            loadInventory();
            loadStatistics(currentDate);
        } else {
            alert('Error adding book');
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

        if (response.ok) {
            if (result.success) {
                alert(`Sold ${quantity} copies of ${title} for ${paymentType}`);
                loadInventory();
                loadStatistics(currentDate);
            } else {
                alert('Out of stock');
            }
        } else {
            alert('Error selling book');
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
        let total = 0;

        inventoryTableBody.innerHTML = '';
        inventory.forEach((item, index) => {
            const totalAmount = item.quantity * item.price;
            total += totalAmount;

            const row = `
                <tr>
                    <td>${item.title}</td>
                    <td>${item.quantity}</td>
                    <td>${totalAmount.toLocaleString()}</td>
                    <td><button class="btn btn-secondary edit-btn" data-index="${index}"><i class="fas fa-pen"></i></button></td>
                </tr>
            `;
            inventoryTableBody.insertAdjacentHTML('beforeend', row);
        });

        inventoryTotal.textContent = total.toLocaleString();
        setupEditButtons();
    }

    async function loadStatistics(date) {
        const response = await fetch('/api/statistics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date })
        });
        const statistics = await response.json();
        let total = 0;

        statisticsTableBody.innerHTML = '';
        statistics.forEach((item, index) => {
            const totalAmount = item.quantity * item.price;
            if (item.action === 'Sold') {
                total += totalAmount;
            }

            const row = `
                <tr>
                    <td>${item.action}</td>
                    <td>${item.title}</td>
                    <td>${item.quantity}</td>
                    <td>${totalAmount.toLocaleString()}</td>
                    <td>${new Date(item.timestamp).toLocaleString()}</td>
                    <td>${item.paymentType}</td>
                    <td>${item.user}</td>
                    <td><button class="btn btn-danger delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
            statisticsTableBody.insertAdjacentHTML('beforeend', row);
        });

        statisticsTotal.textContent = total.toLocaleString();
        setupDeleteButtons();
    }

    function setupEditButtons() {
        const editButtons = document.querySelectorAll('.edit-btn');

        editButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const index = event.target.dataset.index;
                const password = prompt('Enter password:');

                if (password === 'Rasul9898aa') {
                    const newQuantity = prompt('Enter new quantity:');
                    if (newQuantity !== null) {
                        await fetch('/api/edit-inventory', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ index, quantity: newQuantity })
                        });
                        loadInventory();
                    }
                } else {
                    alert('Invalid password.');
                }
            });
        });
    }

    function setupDeleteButtons() {
        const deleteButtons = document.querySelectorAll('.delete-btn');

        deleteButtons.forEach(button => {
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
