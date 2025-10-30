let totalEarnings = 0;

// Mark order as complete
function markComplete(orderId, amount) {
    // Play cha-ching sound
    playChaChingSound();
    
    // Show payment modal
    showPaymentModal(amount);
    
    // Update earnings
    totalEarnings += amount;
    updateEarningsDisplay();
    
    // Remove order from list (or mark as completed)
    const orderCard = document.querySelector(`[data-id="${orderId}"]`);
    if (orderCard) {
        orderCard.style.opacity = '0.5';
        orderCard.querySelector('.complete-btn').disabled = true;
        orderCard.querySelector('.complete-btn').textContent = 'Completed ✓';
    }
    
    // Simulate Uber API call (in production, this would be real)
    setTimeout(() => {
        triggerUberPickup(orderId);
    }, 2000);
}

// Play cha-ching sound
function playChaChingSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzKH0/PQgjMGHm7D7+OaRws');
    audio.volume = 0.5;
    audio.play().catch(() => {
        // Fallback if audio fails
        console.log('CHA-CHING!');
    });
}

// Show payment modal
function showPaymentModal(amount) {
    const modal = document.getElementById('paymentModal');
    const amountDisplay = document.getElementById('paymentAmount');
    
    amountDisplay.textContent = `$${amount.toFixed(2)}`;
    modal.classList.add('show');
    
    // Haptic feedback (if supported)
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('show');
}

// Update earnings display
function updateEarningsDisplay() {
    const earningsDisplay = document.getElementById('todayEarnings');
    earningsDisplay.textContent = `$${totalEarnings.toFixed(2)}`;
    
    // Animate the earnings update
    earningsDisplay.style.animation = 'none';
    setTimeout(() => {
        earningsDisplay.style.animation = 'pulse 0.5s ease';
    }, 10);
}

// Trigger Uber pickup (mock function)
function triggerUberPickup(orderId) {
    console.log(`Triggering Uber pickup for order ${orderId}`);
    
    // In production, this would call the Uber Couriers API
    // For now, we'll show the courier alert after a delay
    setTimeout(() => {
        showCourierAlert();
    }, 5000);
}

// Show courier alert
function showCourierAlert() {
    const alert = document.getElementById('courierAlert');
    alert.classList.add('show');
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
}

// Close courier alert
function closeCourierAlert() {
    const alert = document.getElementById('courierAlert');
    alert.classList.remove('show');
}

// Simulate job count calculation
function updateJobCount() {
    const orders = document.querySelectorAll('.order-card');
    const totalAmount = Array.from(orders).reduce((sum, order) => {
        const amountText = order.querySelector('.order-amount').textContent;
        const amount = parseFloat(amountText.replace('$', ''));
        return sum + amount;
    }, 0);
    
    const jobCount = document.getElementById('jobCount');
    jobCount.textContent = `${orders.length} orders = $${totalAmount.toFixed(2)}`;
}

// Initialize
window.addEventListener('load', () => {
    updateJobCount();
    updateEarningsDisplay();
    
    // Simulate new order notification every 30 seconds
    setInterval(() => {
        console.log('🔔 New order notification (mock)');
    }, 30000);
});

// Optional: Add money rain animation
function addMoneyRain() {
    const container = document.body;
    for (let i = 0; i < 20; i++) {
        const money = document.createElement('div');
        money.textContent = '$';
        money.style.position = 'fixed';
        money.style.fontSize = '24px';
        money.style.color = '#ffd700';
        money.style.fontWeight = 'bold';
        money.style.left = Math.random() * 100 + '%';
        money.style.top = '-20px';
        money.style.zIndex = '9999';
        money.style.pointerEvents = 'none';
        money.style.animation = `moneyFall ${2 + Math.random()}s linear`;
        
        container.appendChild(money);
        
        setTimeout(() => {
            money.remove();
        }, 3000);
    }
}

// Add money fall animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes moneyFall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
