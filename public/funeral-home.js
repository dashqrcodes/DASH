// Funeral Home App JavaScript

let orders = [
    {
        id: 1,
        customerName: "Maria Rodriguez",
        dateOfBirth: "1965-03-15",
        dateOfPassing: "2024-10-22",
        serviceDate: "2024-10-28",
        serviceTime: "14:00",
        serviceLocation: "St. Mary's Church, 123 Main St",
        customerPhone: "(555) 123-4567",
        status: "pending",
        createdAt: new Date()
    },
    {
        id: 2,
        customerName: "John Smith",
        dateOfBirth: "1950-07-20",
        dateOfPassing: "2024-10-23",
        serviceDate: "2024-10-29",
        serviceTime: "10:00",
        serviceLocation: "Greenwood Cemetery Chapel",
        customerPhone: "(555) 987-6543",
        status: "pending",
        createdAt: new Date()
    }
];

// Display orders
function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
    });
    
    updateStats();
}

// Create order card
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
        <div class="order-header">
            <span class="order-name">${order.customerName}</span>
            <span class="order-status-badge ${order.status}">${order.status}</span>
        </div>
        <div class="order-details">
            <p><strong>Service:</strong> ${formatDate(order.serviceDate)} at ${order.serviceTime}</p>
            <p><strong>Location:</strong> ${order.serviceLocation}</p>
            <p><strong>Phone:</strong> ${order.customerPhone}</p>
        </div>
        <div class="order-actions">
            <button class="action-btn primary" onclick="sendReminder(${order.id})">Send Reminder</button>
            <button class="action-btn secondary" onclick="viewOrder(${order.id})">View</button>
        </div>
    `;
    return card;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Update stats
function updateStats() {
    const todayOrders = orders.filter(order => {
        const today = new Date().toDateString();
        const orderDate = new Date(order.createdAt).toDateString();
        return today === orderDate;
    }).length;
    
    const weekOrders = orders.length;
    
    document.getElementById('todayOrders').textContent = todayOrders;
    document.getElementById('weekOrders').textContent = weekOrders;
}

// Create new order
function createOrder(event) {
    event.preventDefault();
    
    const newOrder = {
        id: orders.length + 1,
        customerName: document.getElementById('customerName').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        dateOfPassing: document.getElementById('dateOfPassing').value,
        serviceDate: document.getElementById('serviceDate').value,
        serviceTime: document.getElementById('serviceTime').value,
        serviceLocation: document.getElementById('serviceLocation').value,
        customerPhone: document.getElementById('customerPhone').value,
        status: 'pending',
        createdAt: new Date()
    };
    
    orders.push(newOrder);
    displayOrders();
    closeNewOrderModal();
    
    // Simulate sending text to customer
    console.log(`Text sent to ${newOrder.customerPhone}: Welcome to DASH! Create your slideshow: [LINK]`);
    
    // Reset form
    document.getElementById('newOrderForm').reset();
}

// Open new order modal
function openNewOrderModal() {
    document.getElementById('newOrderModal').classList.add('show');
}

// Close new order modal
function closeNewOrderModal() {
    document.getElementById('newOrderModal').classList.remove('show');
}

// Send reminder
function sendReminder(orderId) {
    const order = orders.find(o => o.id === orderId);
    console.log(`Reminder text sent to ${order.customerPhone}`);
    alert(`Reminder sent to ${order.customerName}`);
}

// View order
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    alert(`Order details for ${order.customerName}\nService: ${formatDate(order.serviceDate)} at ${order.serviceTime}`);
}

// Initialize on load
window.addEventListener('load', () => {
    displayOrders();
});
