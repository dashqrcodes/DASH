const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('.'));

// Endpoint to create payment intent
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', payment_method_types } = req.body;

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            payment_method_types: payment_method_types || ['card'],
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'always',
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to create checkout session (better for Klarna/Affirm)
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { amount, currency = 'usd' } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'klarna', 'link'],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: 'Memorial Slideshow & Cards',
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:3000/success.html',
            cancel_url: 'http://localhost:3000/checkout.html',
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
