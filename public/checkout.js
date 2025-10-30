// Note: Replace with your actual Stripe publishable key
const stripe = Stripe('pk_test_your_key_here');

document.addEventListener('DOMContentLoaded', function() {
    // Payment option buttons
    const payFull = document.getElementById('payFull');
    const payKlarna = document.getElementById('payKlarna');
    const payAffirm = document.getElementById('payAffirm');

    // Handle payment option clicks
    [payFull, payKlarna, payAffirm].forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all
            document.querySelectorAll('.payment-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Add active class to clicked option
            this.classList.add('active');
        });
    });

    // Handle checkout
    payFull.addEventListener('click', async function() {
        try {
            // Create payment intent
            const response = await fetch('/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 30000, // $300.00 in cents
                    currency: 'usd',
                }),
            });

            const { clientSecret } = await response.json();

            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: clientSecret,
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        }
    });

    // Klarna payment
    payKlarna.addEventListener('click', async function() {
        try {
            const response = await fetch('/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 30000,
                    currency: 'usd',
                    payment_method_types: ['klarna'],
                }),
            });

            const { clientSecret } = await response.json();

            const result = await stripe.redirectToCheckout({
                sessionId: clientSecret,
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        }
    });

    // Affirm payment
    payAffirm.addEventListener('click', async function() {
        try {
            const response = await fetch('/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 30000,
                    currency: 'usd',
                    payment_method_types: ['affirm'],
                }),
            });

            const { clientSecret } = await response.json();

            const result = await stripe.redirectToCheckout({
                sessionId: clientSecret,
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        }
    });
});
